import type { AuthResponse, Todo, TodoInput, User } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // token 是后端登录成功后发给前端的“通行证”。
  // 之后请求任务接口时，把 token 放进 Authorization 请求头，后端就知道当前是谁。
  const token = localStorage.getItem('todo_tag_manager_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'token': token ? token : '',
      // ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(payload.error ?? '请求失败');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

type BackendUser = {
  id: number | string;
  username?: string | null;
  email: string;
};

type BackendTodo = {
  id: number | string;
  userId: number | string;
  title: string;
  description?: string | null;
  tag?: string | null;
  completed: boolean;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

function normalizeUser(user: BackendUser): User {
  return {
    id: String(user.id),
    username: user.username || user.email.split('@')[0],
    email: user.email,
    // 真实后端会保存加密后的密码，前端不保存密码。
    password: '',
  };
}

function normalizeTodo(todo: BackendTodo): Todo {
  return {
    id: String(todo.id),
    userId: String(todo.userId),
    title: todo.title,
    description: todo.description ?? '',
    tag: todo.tag ?? '生活',
    completed: todo.completed,
    // HTML 的 date input 需要 yyyy-mm-dd；后端 DateTime 可能是完整 ISO 字符串，所以只取前 10 位。
    dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : '',
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  };
}

export const api = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const result = await request<{
      message: string;
      token?: string;
      user?: BackendUser;
      userId?: number | string;
    }>('/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    // 推荐后端注册成功后直接返回 token 和 user；如果你的后端暂时只返回 userId，这里也能兜底。
    return {
      token: result.token ?? '',
      user: normalizeUser(
        result.user ?? {
          id: result.userId ?? '',
          username,
          email,
        },
      ),
    };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await request<{
      token: string;
      user?: BackendUser;
      userId?: number | string;
    }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    return {
      token: result.token,
      user: normalizeUser(
        result.user ?? {
          id: result.userId ?? '',
          email,
        },
      ),
    };
  },

  async getTodos() {
    const todos = await request<BackendTodo[]>('/todos');
    return todos.map(normalizeTodo);
  },

  async createTodo(input: TodoInput) {
    const todo = await request<BackendTodo>('/todos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return normalizeTodo(todo);
  },

  async updateTodo(id: string, data: Partial<TodoInput & Pick<Todo, 'completed'>>) {
    const todo = await request<BackendTodo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return normalizeTodo(todo);
  },

  deleteTodo(id: string) {
    return request<void>(`/todos/${id}`, {
      method: 'DELETE',
    });
  },

  deleteCompletedTodos() {
    return request<{ message: string; count: number }>('/todos/completed', {
      method: 'DELETE',
    });
  },
};
