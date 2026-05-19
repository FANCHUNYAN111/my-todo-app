# Todo Tag Manager

一个使用 React + TypeScript + Vite 构建的个人任务管理工具，适合作为 CRUD 练习项目或作品集展示。当前版本默认调用后端 `/api` 接口，`localStorage` 只保存登录 token 和当前用户信息。

## 功能

- 用户注册、登录、退出登录，默认请求后端 API
- 未登录用户自动跳转登录页
- 任务创建、查看、编辑、删除
- 任务完成 / 未完成切换
- 不同用户只能看到自己的任务，由后端 `authMiddleware` 和数据库查询保证
- 标签筛选、完成状态筛选、关键词搜索
- 截止日期展示、即将到期和已过期视觉提示
- 简单分页
- 任务统计
- 响应式 Dashboard、登录页、注册页和 404 页面

## 运行

```bash
npm install
npm run dev
```

浏览器访问 Vite 输出的本地地址，通常是 `http://localhost:5173`。

注意：当前前端会请求 `/api`，`vite.config.ts` 已经把 `/api` 代理到 `http://localhost:3000`，所以你的后端也需要先启动在 3000 端口。

## 主要文件说明

- `src/main.tsx`：React 应用入口。
- `src/App.tsx`：应用级路由挂载。
- `src/routes/ProtectedRoute.tsx`：登录保护路由，未登录时跳转登录页。
- `src/pages/LoginPage.tsx`：登录页面。
- `src/pages/RegisterPage.tsx`：注册页面。
- `src/pages/DashboardPage.tsx`：任务管理首页，包含统计、筛选、搜索、分页和 CRUD 操作。
- `src/pages/NotFoundPage.tsx`：404 页面。
- `src/components/TodoForm.tsx`：任务创建 / 编辑表单。
- `src/components/TodoCard.tsx`：任务卡片展示和操作。
- `src/components/StatsCard.tsx`：统计卡片。
- `src/components/FilterBar.tsx`：搜索、标签和完成状态筛选。
- `src/hooks/useAuth.tsx`：认证状态和注册 / 登录 / 退出逻辑。
- `src/hooks/useTodos.ts`：任务数据增删改查，会调用后端 API 并更新页面状态。
- `src/utils/storage.ts`：localStorage 读写封装。
- `src/utils/api.ts`：前端请求后端 API 的统一封装。
- `src/utils/id.ts`：生成本地用户和任务 id，兼容不支持 `crypto.randomUUID` 的浏览器。
- `src/types/index.ts`：User、Todo 等类型定义。
- `src/styles/global.css`：全局样式和响应式布局。
- `docs/backend-api-upgrade.md`：后端 Prisma 模型和 Express 接口改造示例。
- `docs/react-beginner-reading-guide.md`：React 新手阅读顺序和数据流解释。

## 新手建议阅读顺序

如果你还没有用过 React，可以按这个顺序看代码：

1. 先看 `src/main.tsx`，理解 React 应用是如何挂载到 `index.html` 的。
2. 再看 `src/App.tsx`，理解不同 URL 如何对应不同页面。
3. 然后看 `docs/react-beginner-reading-guide.md`，先用中文理解整体流程。
4. 再看 `src/hooks/useAuth.tsx`，理解登录状态如何通过 React 状态、token 和后端 API 保存。
5. 接着看 `src/hooks/useTodos.ts`，理解任务的增删改查如何请求后端并更新页面。
6. 最后看 `src/pages/DashboardPage.tsx`，理解页面如何把 hook、组件、搜索、筛选和分页组合起来。

代码中已经在关键位置加了注释，注释重点解释“为什么这样写”，方便你边运行边阅读。

## 手机端适配

样式在 `src/styles/global.css` 中通过 `@media (max-width: 900px)` 和 `@media (max-width: 640px)` 做了响应式适配：

- 登录 / 注册页会从左右两栏变成上下排列。
- Dashboard 顶部按钮在手机端会铺满宽度，便于手指点击。
- 统计卡片和筛选栏会变成单列布局。
- 任务卡片在手机端会把操作按钮移到下一行。
- 表单弹窗在窄屏下会保持可滚动，避免内容溢出屏幕。

## 后端接口接入提示

当前项目默认请求后端 API。你已有的后端接口需要支持这些路由：

- 注册：`POST /api/register`
- 登录：`POST /api/login`
- 获取任务：`GET /api/todos`
- 创建任务：`POST /api/todos`
- 更新任务：`PUT /api/todos/:id`
- 删除任务：`DELETE /api/todos/:id`
- 清理已完成任务：`DELETE /api/todos/completed`

注意：你原来的后端示例里 todo 字段主要包含 `title` 和 `completed`。如果要完整支持描述、标签、截止日期，需要后端 Prisma 模型和接口同步增加 `description`、`tag`、`dueDate`、`createdAt`、`updatedAt` 等字段。具体代码见 `docs/backend-api-upgrade.md`。

### 从 localStorage 切换到后端 API 的思路

当前代码已经完成切换：

1. `src/hooks/useAuth.tsx` 里的 `register` 和 `login` 已经改成 `async`，会调用 `api.register` / `api.login`。
2. 登录成功后，前端会保存后端返回的 `token`，并保存一个当前用户信息用于刷新页面后恢复显示。
3. `src/hooks/useTodos.ts` 已经增加 `useEffect`，Dashboard 打开时会调用 `api.getTodos()` 拉取任务列表。
4. 创建任务会调用 `api.createTodo(input)`，把标题、描述、标签、截止日期一起发给后端。
5. 编辑任务会调用 `api.updateTodo(id, data)`，成功后再更新页面状态。
6. 删除任务会调用 `api.deleteTodo(id)`，成功后再从页面列表移除。

切换后，`localStorage` 只建议继续保存两类东西：登录 token，以及一个简单的当前用户信息。任务数据应以后端数据库为准。
