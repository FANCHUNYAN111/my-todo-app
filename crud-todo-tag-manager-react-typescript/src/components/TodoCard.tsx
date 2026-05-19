import { CalendarDays, Check, Pencil, Trash2, Undo2 } from 'lucide-react';
import type { Todo } from '../types';
import { formatDate, getDueStatus } from '../utils/date';

type TodoCardProps = {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
};

const dueLabels = {
  normal: '',
  soon: '即将到期',
  overdue: '已过期',
};

export default function TodoCard({ todo, onEdit, onDelete, onToggle }: TodoCardProps) {
  const dueStatus = getDueStatus(todo.dueDate, todo.completed);

  return (
    <article className={`todo-card ${todo.completed ? 'todo-card--done' : ''}`}>
      <div className="todo-card__main">
        <button
          className={`check-button ${todo.completed ? 'checked' : ''}`}
          type="button"
          onClick={() => onToggle(todo.id)}
          aria-label={todo.completed ? '标记为未完成' : '标记为完成'}
          title={todo.completed ? '标记为未完成' : '标记为完成'}
        >
          {todo.completed ? <Check size={17} /> : null}
        </button>

        <div className="todo-content">
          <div className="todo-title-row">
            <h3>{todo.title}</h3>
            <span className="tag-pill">{todo.tag}</span>
          </div>
          <p>{todo.description || '暂无描述'}</p>
          <div className="todo-meta">
            <span className={`due-badge due-badge--${dueStatus}`}>
              <CalendarDays size={15} />
              {formatDate(todo.dueDate)}
              {dueLabels[dueStatus] && <strong>{dueLabels[dueStatus]}</strong>}
            </span>
          </div>
        </div>
      </div>

      <div className="todo-actions">
        <button type="button" onClick={() => onToggle(todo.id)} title="切换状态">
          {todo.completed ? <Undo2 size={17} /> : <Check size={17} />}
        </button>
        <button type="button" onClick={() => onEdit(todo)} title="编辑任务">
          <Pencil size={17} />
        </button>
        <button className="danger" type="button" onClick={() => onDelete(todo.id)} title="删除任务">
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}
