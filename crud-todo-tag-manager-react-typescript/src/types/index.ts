export type User = {
  // 前端统一把 id 当字符串使用；后端如果返回数字 id，会在 api.ts 里转成字符串。
  id: string;
  username: string;
  email: string;
  // 接入真实后端后，前端不应该保存真实密码；这里保留字段是为了兼容之前的 localStorage 版本类型。
  password: string;
};

export type Todo = {
  id: string;
  userId: string;
  title: string;
  description: string;
  tag: string;
  completed: boolean;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export type TodoInput = {
  title: string;
  description: string;
  tag: string;
  dueDate: string;
};

export type StatusFilter = 'all' | 'active' | 'completed';

export type AuthState = {
  currentUser: User | null;
  isAuthenticated: boolean;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type TodoStats = {
  total: number;
  completed: number;
  active: number;
};
