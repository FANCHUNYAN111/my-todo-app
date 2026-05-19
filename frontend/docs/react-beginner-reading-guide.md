# React 新手阅读指南

这份文档按“页面是怎么跑起来的”来解释项目。你可以先读这里，再去看源码。

## 1. 先理解一个 React 页面是什么

React 里一个页面或一个小模块，通常就是一个函数。

例如：

```tsx
export default function LoginPage() {
  return <main>登录页面</main>;
}
```

这个函数返回的 HTML 样子，叫 JSX。JSX 看起来像 HTML，但它其实写在 JavaScript / TypeScript 里面。

## 2. `useState` 是什么

`useState` 用来保存页面里会变化的数据。

例如登录页里：

```tsx
const [email, setEmail] = useState('');
```

可以理解成：

- `email`：当前输入框里的邮箱值
- `setEmail`：修改 email 的函数
- `useState('')`：初始值是空字符串

输入框变化时：

```tsx
onChange={(event) => setEmail(event.target.value)}
```

意思是：用户每输入一个字符，就把输入框的新值保存到 `email`。

## 3. `useEffect` 是什么

`useEffect` 用来处理“页面显示后要做的事”。

在 `useTodos.ts` 里：

```tsx
useEffect(() => {
  loadTodos();
}, [userId]);
```

意思是：

- Dashboard 页面打开后，调用 `loadTodos()`
- `loadTodos()` 会请求后端 `/api/todos`
- 后端返回任务后，保存到 `todos`
- `todos` 一变化，页面自动重新渲染

## 4. `useAuth` 是什么

`useAuth` 是项目自己写的一个 hook。

它负责登录相关的事情：

- 当前用户是谁：`currentUser`
- 有没有登录：`isAuthenticated`
- 注册：`register`
- 登录：`login`
- 退出：`logout`

登录流程是：

1. 用户在登录页输入邮箱和密码。
2. 点击登录按钮。
3. `LoginPage` 调用 `login(email, password)`。
4. `useAuth` 里面调用 `api.login(email, password)`。
5. `api.login` 请求后端 `/api/login`。
6. 后端返回 `token` 和 `user`。
7. 前端把 token 存起来，把 user 设置成当前用户。
8. 页面跳转到 Dashboard。

## 5. `useTodos` 是什么

`useTodos` 也是项目自己写的 hook。

它负责任务相关的事情：

- 获取任务：`loadTodos`
- 创建任务：`createTodo`
- 编辑任务：`updateTodo`
- 删除任务：`deleteTodo`
- 切换完成状态：`toggleTodo`
- 清理已完成：`deleteCompletedTodos`

例如创建任务：

1. 用户点击“新建任务”。
2. Dashboard 打开 `TodoForm` 弹窗。
3. 用户填写标题、描述、标签、日期。
4. 点击创建。
5. `TodoForm` 把表单数据交给 Dashboard。
6. Dashboard 调用 `createTodo(input)`。
7. `useTodos` 调用 `api.createTodo(input)`。
8. `api.createTodo` 请求后端 `POST /api/todos`。
9. 后端保存到数据库，并返回新任务。
10. 前端把新任务放进 `todos` 列表，页面自动更新。

## 6. `api.ts` 是什么

`src/utils/api.ts` 是前端和后端沟通的地方。

你可以把它理解成“前端的后端接口说明书”：

- `api.login` 调 `/api/login`
- `api.register` 调 `/api/register`
- `api.getTodos` 调 `/api/todos`
- `api.createTodo` 调 `/api/todos`
- `api.updateTodo` 调 `/api/todos/:id`
- `api.deleteTodo` 调 `/api/todos/:id`

这样页面组件不用关心 fetch 怎么写，只需要调用这些函数。

## 7. token 是什么

token 可以理解为“登录凭证”。

登录成功后，后端返回 token。前端把它存在 localStorage：

```ts
localStorage.setItem('todo_tag_manager_token', result.token);
```

之后请求任务接口时，`api.ts` 会自动把 token 放进请求头：

```ts
Authorization: Bearer token
```

后端的 `authMiddleware` 会检查这个 token，确认当前用户是谁。

## 8. 为什么还有 localStorage

现在任务数据和用户注册登录都走后端了。

localStorage 只保留两类数据：

- `todo_tag_manager_token`：登录凭证
- `todo_tag_manager_current_user`：刷新页面后用来显示当前用户

真正的用户和任务数据，以后端数据库为准。

## 9. 推荐调试顺序

如果页面出问题，可以按这个顺序查：

1. 后端是否运行在 `http://localhost:3000`
2. 前端是否运行在 `http://localhost:5173`
3. 登录接口 `/api/login` 是否返回 token
4. 浏览器开发者工具 Network 里，请求是否是 200
5. 如果是 401，通常是 token 没传或 token 失效
6. 如果是 500，通常是后端代码或数据库字段问题
