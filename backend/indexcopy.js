require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');

const prisma = new PrismaClient();
const app = express();
const { z } = require('zod');
// 或者 const z = require('zod');
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_key';

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const emailSchema = z.string().email();
  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' });
  }
  if (!emailSchema.safeParse(email).success) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        username: username?.trim() || null,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      message: '注册成功',
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({ error: '邮箱已被注册' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    return res.status(400).json({ error: '用户不存在' });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(400).json({ error: '密码错误' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});

app.delete('/api/todos/completed', authMiddleware, async (req, res) => {
  try {
    const result = await prisma.todo.deleteMany({
      where: { userId: req.userId, completed: true }
    });
    res.json({ message: `成功删除 ${result.count} 个任务`, count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '删除任务失败' });
  }
});

app.get('/api/todos', authMiddleware, async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取任务失败' });
  }
});
app.post('/api/todos', authMiddleware, async (req, res) => {
  const { title, description, tag, dueDate } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: '任务标题不能为空' });
  }

  try {
    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || '',
        tag: tag?.trim() || '生活',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.userId,
      },
    });

    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '创建任务失败' });
  }
});

app.put('/api/todos/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, tag, completed, dueDate } = req.body;

  try {
    const existingTodo = await prisma.todo.findFirst({
      where: { id: Number(id), userId: req.userId },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: '任务不存在或无权操作' });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: Number(id) },
      data: {
        title: title !== undefined ? title.trim() : existingTodo.title,
        description:
          description !== undefined ? description.trim() : existingTodo.description,
        tag: tag !== undefined ? tag.trim() : existingTodo.tag,
        completed: completed !== undefined ? completed : existingTodo.completed,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingTodo.dueDate,
      },
    });

    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '更新任务失败' });
  }
});

app.delete('/api/todos/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const existingTodo = await prisma.todo.findFirst({
      where: { id: Number(id), userId: req.userId }
    });
    if (!existingTodo) {
      return res.status(404).json({ error: '任务不存在或无权操作' });
    }
    await prisma.todo.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: '删除任务失败' });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: '路由未找到' });
});
// 目前每个路由都有重复的 try/catch，可以创建一个统一的错误处理函数：
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});