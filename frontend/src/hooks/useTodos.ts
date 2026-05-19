import { useEffect, useMemo, useState } from 'react';
import type { Todo, TodoInput } from '../types';
import { api } from '../utils/api';

export function useTodos(userId: string) {
  // todos 是页面要展示的任务数组。
  // setTodos 是修改这个数组的方法。调用 setTodos 后，React 会自动重新渲染页面。
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTodos() {
    // 进入 Dashboard 后，向后端请求当前登录用户的任务。
    // 后端会根据 token 里的 userId 自动筛选，所以前端不需要自己过滤其他用户的任务。
    setLoading(true);
    setError('');

    try {
      const nextTodos = await api.getTodos();
      setTodos(nextTodos);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取任务失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // useEffect 会在组件第一次显示时执行。
    // userId 变化时也会重新拉取任务，例如切换了登录用户。
    loadTodos();
  }, [userId]);

  async function createTodo(input: TodoInput) {
    // 创建任务：先请求后端 POST /api/todos，成功后把后端返回的新任务放到列表最前面。
    const createdTodo = await api.createTodo(input);
    setTodos((currentTodos) => [createdTodo, ...currentTodos]);
  }

  async function updateTodo(id: string, input: TodoInput) {
    // 编辑任务：先请求后端 PUT /api/todos/:id，成功后用后端返回的新数据替换旧数据。
    const updatedTodo = await api.updateTodo(id, input);

    // map 的意思是“遍历每一个任务，并返回一个新数组”。
    // 如果是正在编辑的任务，就换成 updatedTodo；不是的话保持原样。
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? updatedTodo : todo,
      ),
    );
  }

  async function toggleTodo(id: string) {
    // 先在当前列表中找到被点击的任务。
    const targetTodo = todos.find((todo) => todo.id === id);
    if (!targetTodo) return;

    // 把 completed 改成相反值，然后交给后端保存。
    const updatedTodo = await api.updateTodo(id, {
      completed: !targetTodo.completed,
    });

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? updatedTodo : todo,
      ),
    );
  }

  async function deleteTodo(id: string) {
    // 删除任务：先请求后端 DELETE /api/todos/:id。
    await api.deleteTodo(id);

    // 后端删除成功后，前端列表也把这个任务移除。
    // filter 的意思是“过滤”，这里只保留 id 不等于被删除 id 的任务。
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  async function deleteCompletedTodos() {
    await api.deleteCompletedTodos();
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  }

  const stats = useMemo(
    // 统计数据是根据 todos 计算出来的，不需要后端专门给。
    // useMemo 的作用：只有 todos 变化时才重新计算统计，避免每次渲染都重复算。
    () => ({
      total: todos.length,
      completed: todos.filter((todo) => todo.completed).length,
      active: todos.filter((todo) => !todo.completed).length,
    }),
    [todos],
  );

  return {
    todos,
    loading,
    error,
    stats,
    reloadTodos: loadTodos,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    deleteCompletedTodos,
  };
}
