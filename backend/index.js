require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json()); // 让 express 能解析 JSON 格式的请求体
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// ==================== Todo CRUD（需要 token 验证） ====================
// 获取当前用户的所有任务
app.get('/api/todos', authMiddleware, async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: '获取任务失败' });
  }
});

// 创建新任务
app.post('/api/todos', authMiddleware, async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: '任务标题不能为空' });
  }
  try {
    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim(),
        userId: req.userId
      }
    });
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: '创建任务失败' });
  }
});

// 更新任务（可更新标题或完成状态）
app.put('/api/todos/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  try {
    // 先确认该任务属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: { id: Number(id), userId: req.userId }
    });
    if (!existingTodo) {
      return res.status(404).json({ error: '任务不存在或无权操作' });
    }
    const updatedTodo = await prisma.todo.update({
      where: { id: Number(id) },
      data: {
        title: title !== undefined ? title : existingTodo.title,
        completed: completed !== undefined ? completed : existingTodo.completed
      }
    });
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: '更新任务失败' });
  }
});

// 删除任务
app.delete('/api/todos/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // 先确认该任务属于当前用户
    const existingTodo = await prisma.todo.findFirst({
      where: { id: Number(id), userId: req.userId }
    });
    if (!existingTodo) {
      return res.status(404).json({ error: '任务不存在或无权操作' });
    }
    await prisma.todo.delete({ where: { id: Number(id) } });
    res.status(204).send(); // 无内容响应
  } catch (error) {
    res.status(500).json({ error: '删除任务失败' });
  }
});
// app.delete('/api/todos/completed', authMiddleware, async (req, res) => {
//   try {
//     // 先确认该任务属于当前用户
//     // const existingTodo = await prisma.todo.findFirst({
//     //   where: { id: Number(id), userId: req.userId }
//     // });
//     // if (!existingTodo) {
//     //   return res.status(404).json({ error: '任务不存在或无权操作' });
//     // }
//     await prisma.todo.delete({ where: { completed: true } });
//     res.status(204).send(); // 无内容响应
//   } catch (error) {
//     res.status(500).json({ error: '删除任务失败' });
//   }
// });

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' });
  }
  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword }
    });
    res.json({ message: '注册成功', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: '邮箱已被注册' });
  }
});

/**
 * 用户登录接口
 * @route POST /api/login
 * @param {Object} req - Express 请求对象
 * @param {string} req.body.email - 用户邮箱
 * @param {string} req.body.password - 用户密码
 * @param {Object} res - Express 响应对象
 * @returns {Object} 登录成功时返回JWT令牌和用户ID，失败时返回错误信息
 */
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: '用户不存在' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ error: '密码错误' });
  }
  const token = jwt.sign({ userId: user.id }, 'my_secret_key', { expiresIn: '1d' });
  res.json({ token, userId: user.id });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});