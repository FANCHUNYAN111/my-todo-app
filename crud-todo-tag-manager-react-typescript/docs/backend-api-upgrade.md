# 后端接口字段完善指南

这份文档基于你给出的 Express + Prisma + JWT 后端代码整理。目标是让后端支持前端项目里的完整任务字段：

- `title`：标题
- `description`：描述
- `tag`：标签
- `completed`：是否完成
- `dueDate`：截止日期
- `createdAt`：创建时间
- `updatedAt`：更新时间

## 1. Prisma 模型建议

打开后端项目里的 `prisma/schema.prisma`，确认模型类似下面这样。

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String?
  email     String   @unique
  password  String
  todos     Todo[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Todo {
  id          Int      @id @default(autoincrement())
  userId      Int
  title       String
  description String   @default("")
  tag         String   @default("生活")
  completed   Boolean  @default(false)
  dueDate     DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

修改 Prisma 模型后，需要执行迁移：

```bash
npx prisma migrate dev --name add_todo_detail_fields
```

如果你只是本地练习，数据库不要了也可以重置，但会清空数据：

```bash
npx prisma migrate reset
```

## 2. 注册接口修改

你原来的注册接口只接收 `email` 和 `password`。前端注册页还有 `username`，建议一起保存。

推荐返回 `token` 和 `user`，这样用户注册后可以直接进入任务页。

```js
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
```

## 3. 登录接口修改

你原来的登录接口只返回 `token` 和 `userId`。建议返回完整一点的 `user`，前端就能显示用户名和邮箱。

```js
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
```

## 4. 获取任务接口

这个接口基本可以保留。它通过 `authMiddleware` 里的 `req.userId` 只查当前用户任务。

```js
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
```

## 5. 创建任务接口修改

你原来的创建接口只接收 `title`。现在要接收 `description`、`tag`、`dueDate`。

```js
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
```

## 6. 更新任务接口修改

你原来的更新接口只支持 `title` 和 `completed`。现在需要支持所有可编辑字段。

```js
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
```

## 7. 删除接口可以保留

你的单个删除接口已经会校验当前用户是否有权限操作，逻辑是对的。

```js
app.delete('/api/todos/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const existingTodo = await prisma.todo.findFirst({
      where: { id: Number(id), userId: req.userId },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: '任务不存在或无权操作' });
    }

    await prisma.todo.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '删除任务失败' });
  }
});
```

## 8. 清理已完成任务可以保留

```js
app.delete('/api/todos/completed', authMiddleware, async (req, res) => {
  try {
    const result = await prisma.todo.deleteMany({
      where: { userId: req.userId, completed: true },
    });

    res.json({ message: `成功删除 ${result.count} 个任务`, count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '删除任务失败' });
  }
});
```

## 9. 还需要检查的地方

- `authMiddleware` 必须从请求头读取 `Authorization: Bearer token`。
- `jwt.verify` 后要把 `userId` 放到 `req.userId`。
- 后端需要允许前端跨域请求。如果前端通过 Vite proxy 调后端，一般不需要额外 CORS；如果前端和后端端口直接跨域访问，需要安装并使用 `cors`。
- 前端 `vite.config.ts` 已经配置 `/api` 代理到 `http://localhost:3000`，所以后端需要运行在 3000 端口。
- 注册接口建议返回 token，否则前端需要注册后再调用一次登录接口。当前前端已经做了这个兼容。
