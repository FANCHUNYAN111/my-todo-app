import { createContext, useContext, useMemo, useState } from 'react';
import type { AuthState, User } from '../types';
import { api } from '../utils/api';
import { storage } from '../utils/storage';

type AuthContextValue = AuthState & {
  register: (data: Pick<User, 'username' | 'email' | 'password'>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // useState 用来保存“当前登录用户”。
  // 这里仍然从 localStorage 读取当前用户，是为了刷新页面后不掉登录。
  // 注意：这里不再保存所有用户列表，用户数据以真实后端数据库为准。
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());

  // useMemo 会缓存这个对象。
  // 简单理解：只要 currentUser 没变，React 就复用同一个 value，不反复创建 register/login/logout。
  const value = useMemo<AuthContextValue>(() => {
    return {
      currentUser,
      isAuthenticated: Boolean(currentUser),

      async register({ username, email, password }) {
        // 现在注册不再写 localStorage 用户列表，而是请求后端 POST /api/register。
        // await 的意思是：等后端返回结果后，再继续执行下面的代码。
        const normalizedEmail = email.trim().toLowerCase();

        if (password.length < 6) {
          throw new Error('密码至少需要 6 位');
        }

        let result = await api.register(username.trim(), normalizedEmail, password);

        // 更完整的后端会在注册成功后直接返回 token。
        // 如果你的后端暂时只返回“注册成功 + userId”，这里会立刻再调用一次登录接口拿 token。
        // 这样用户点击“注册并进入”后，不需要手动再登录一次。
        if (!result.token) {
          result = await api.login(normalizedEmail, password);
        }

        localStorage.setItem('todo_tag_manager_token', result.token);
        storage.setCurrentUser(result.user);
        setCurrentUser(result.user);
      },

      async login(email, password) {
        // 登录请求后端 POST /api/login。
        // 后端校验密码成功后，会返回 token 和用户信息。
        const normalizedEmail = email.trim().toLowerCase();
        const result = await api.login(normalizedEmail, password);

        // 保存 token：之后 api.ts 会自动把 token 放进请求头 Authorization。
        localStorage.setItem('todo_tag_manager_token', result.token);
        storage.setCurrentUser(result.user);
        setCurrentUser(result.user);
      },

      logout() {
        // 退出登录要清两样东西：
        // 1. currentUser：前端用它判断是否已登录。
        // 2. token：后端用它判断请求有没有权限。
        localStorage.removeItem('todo_tag_manager_token');
        storage.clearCurrentUser();
        setCurrentUser(null);
      },
    };
  }, [currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    // 这个报错能提醒开发者：useAuth 必须写在 AuthProvider 包裹的组件里面。
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
