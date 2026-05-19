import type { Todo, User } from '../types';

const USERS_KEY = 'todo_tag_manager_users';
const TODOS_KEY = 'todo_tag_manager_todos';
const CURRENT_USER_KEY = 'todo_tag_manager_current_user';

function readJson<T>(key: string, fallback: T): T {
  // localStorage 只能保存字符串，所以读取后需要 JSON.parse 转回对象或数组。
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  // 写入前用 JSON.stringify 把对象或数组转成字符串。
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getUsers(): User[] {
    return readJson<User[]>(USERS_KEY, []);
  },

  saveUsers(users: User[]) {
    writeJson(USERS_KEY, users);
  },

  getTodos(): Todo[] {
    return readJson<Todo[]>(TODOS_KEY, []);
  },

  saveTodos(todos: Todo[]) {
    writeJson(TODOS_KEY, todos);
  },

  getCurrentUser(): User | null {
    return readJson<User | null>(CURRENT_USER_KEY, null);
  },

  setCurrentUser(user: User) {
    writeJson(CURRENT_USER_KEY, user);
  },

  clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
};
