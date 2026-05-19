import { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, ClipboardList, LogOut, Plus, Trash2 } from 'lucide-react';
import FilterBar from '../components/FilterBar';
import StatsCard from '../components/StatsCard';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import { useAuth } from '../hooks/useAuth';
import { useTodos } from '../hooks/useTodos';
import type { StatusFilter, Todo, TodoInput } from '../types';

const PAGE_SIZE = 6;

export default function DashboardPage() {
  // useAuth 提供当前用户和退出登录方法。
  const { currentUser, logout } = useAuth();
  // useTodos 根据当前用户 id 返回这个用户自己的任务和 CRUD 方法。
  const {
    todos,
    loading,
    error,
    stats,
    createTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    deleteCompletedTodos,
  } = useTodos(currentUser!.id);

  // 下面这些 useState 保存页面交互状态：搜索词、筛选条件、页码、正在编辑的任务等。
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionError, setActionError] = useState('');

  // 从任务列表中提取已有标签，并用 Set 去重。
  const tags = useMemo(() => Array.from(new Set(todos.map((todo) => todo.tag))), [todos]);

  // filteredTodos 是“原始任务列表 + 搜索 + 标签筛选 + 状态筛选”的结果。
  const filteredTodos = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return todos.filter((todo) => {
      const matchKeyword =
        !keyword ||
        todo.title.toLowerCase().includes(keyword) ||
        todo.description.toLowerCase().includes(keyword);
      const matchTag = selectedTag === 'all' || todo.tag === selectedTag;
      const matchStatus =
        status === 'all' ||
        (status === 'completed' && todo.completed) ||
        (status === 'active' && !todo.completed);

      return matchKeyword && matchTag && matchStatus;
    });
  }, [todos, search, selectedTag, status]);

  // 分页只影响当前显示的任务，不会修改真实数据。
  const pageCount = Math.max(1, Math.ceil(filteredTodos.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedTodos = filteredTodos.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetFiltersPage() {
    setPage(1);
  }

  async function handleSubmit(input: TodoInput) {
    setActionError('');

    try {
      // 如果 editingTodo 有值，说明弹窗在编辑任务；否则就是创建任务。
      if (editingTodo) {
        await updateTodo(editingTodo.id, input);
      } else {
        await createTodo(input);
      }

      setEditingTodo(null);
      setIsFormOpen(false);
    } catch (err) {
      throw err instanceof Error ? err : new Error('保存任务失败');
    }
  }

  async function handleDelete(id: string) {
    // 删除属于高风险操作，所以先用 confirm 做二次确认。
    if (window.confirm('确定要删除这个任务吗？此操作无法撤销。')) {
      try {
        await deleteTodo(id);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : '删除任务失败');
      }
    }
  }

  async function handleToggle(id: string) {
    setActionError('');

    try {
      await toggleTodo(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '更新任务状态失败');
    }
  }

  async function handleDeleteCompleted() {
    if (stats.completed === 0) return;

    if (window.confirm(`确定要删除 ${stats.completed} 个已完成任务吗？`)) {
      try {
        await deleteCompletedTodos();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : '清理已完成任务失败');
      }
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Todo Tag Manager</span>
          <h1>你好，{currentUser?.username}</h1>
          <p>{currentUser?.email}</p>
        </div>

        <div className="header-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={handleDeleteCompleted}
            disabled={stats.completed === 0}
          >
            <Trash2 size={18} />
            清理已完成
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setEditingTodo(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={18} />
            新建任务
          </button>
          <button className="icon-text-button" type="button" onClick={logout}>
            <LogOut size={18} />
            退出
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <StatsCard title="全部任务" value={stats.total} icon={ClipboardList} tone="blue" />
        <StatsCard title="已完成" value={stats.completed} icon={CheckCircle2} tone="green" />
        <StatsCard title="未完成" value={stats.active} icon={BarChart3} tone="orange" />
      </section>

      <FilterBar
        search={search}
        tag={selectedTag}
        status={status}
        tags={tags}
        onSearchChange={(value) => {
          setSearch(value);
          resetFiltersPage();
        }}
        onTagChange={(value) => {
          setSelectedTag(value);
          resetFiltersPage();
        }}
        onStatusChange={(value) => {
          setStatus(value);
          resetFiltersPage();
        }}
      />

      {(error || actionError) && <p className="page-error">{actionError || error}</p>}

      <section className="list-section">
        <div className="list-heading">
          <div>
            <h2>任务列表</h2>
            <p>共找到 {filteredTodos.length} 个任务</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <ClipboardList size={42} />
            <h3>任务加载中</h3>
            <p>正在从后端读取你的任务数据。</p>
          </div>
        ) : pagedTodos.length > 0 ? (
          <div className="todo-list">
            {pagedTodos.map((todo) => (
              // key 帮助 React 识别列表中的每一项，通常使用稳定唯一的 id。
              <TodoCard
                key={todo.id}
                todo={todo}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={(target) => {
                  setEditingTodo(target);
                  setIsFormOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList size={42} />
            <h3>暂无匹配任务</h3>
            <p>可以新建任务，或调整搜索和筛选条件。</p>
          </div>
        )}

        <div className="pagination">
          <button type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
            上一页
          </button>
          <span>
            第 {safePage} / {pageCount} 页
          </span>
          <button
            type="button"
            disabled={safePage === pageCount}
            onClick={() => setPage(safePage + 1)}
          >
            下一页
          </button>
        </div>
      </section>

      {/* isFormOpen 为 true 时才渲染弹窗，这也是 React 常见的条件渲染写法。 */}
      {isFormOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true">
            <TodoForm
              initialTodo={editingTodo}
              onSubmit={handleSubmit}
              onCancel={() => {
                setEditingTodo(null);
                setIsFormOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
