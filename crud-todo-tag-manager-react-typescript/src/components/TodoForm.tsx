import { useEffect, useState } from 'react';
import type { Todo, TodoInput } from '../types';

const DEFAULT_TAGS = ['工作', '学习', '生活', '紧急'];

type TodoFormProps = {
  initialTodo?: Todo | null;
  onSubmit: (input: TodoInput) => void | Promise<void>;
  onCancel: () => void;
};

const emptyForm: TodoInput = {
  title: '',
  description: '',
  tag: DEFAULT_TAGS[0],
  dueDate: '',
};

export default function TodoForm({ initialTodo, onSubmit, onCancel }: TodoFormProps) {
  const [form, setForm] = useState<TodoInput>(emptyForm);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialTodo) {
      setForm({
        title: initialTodo.title,
        description: initialTodo.description,
        tag: DEFAULT_TAGS.includes(initialTodo.tag) ? initialTodo.tag : '自定义',
        dueDate: initialTodo.dueDate,
      });
      setCustomTag(DEFAULT_TAGS.includes(initialTodo.tag) ? '' : initialTodo.tag);
    } else {
      setForm(emptyForm);
      setCustomTag('');
    }
    setError('');
  }, [initialTodo]);

  function updateField(field: keyof TodoInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const finalTag = form.tag === '自定义' ? customTag.trim() : form.tag;

    if (!form.title.trim()) {
      setError('请输入任务标题');
      return;
    }

    if (!finalTag) {
      setError('请选择或输入标签');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        tag: finalTag,
        dueDate: form.dueDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存任务失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="modal-header">
        <div>
          <span className="eyebrow">{initialTodo ? '编辑任务' : '新建任务'}</span>
          <h2>{initialTodo ? '调整任务信息' : '记录一个新任务'}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="关闭">
          ×
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <label>
        标题
        <input
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="例如：完成作品集项目"
          autoFocus
        />
      </label>

      <label>
        描述
        <textarea
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="补充任务背景、步骤或验收标准"
          rows={4}
        />
      </label>

      <div className="form-grid">
        <label>
          标签
          <select value={form.tag} onChange={(event) => updateField('tag', event.target.value)}>
            {DEFAULT_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
            <option value="自定义">自定义</option>
          </select>
        </label>

        <label>
          截止日期
          <input
            type="date"
            value={form.dueDate}
            onChange={(event) => updateField('dueDate', event.target.value)}
          />
        </label>
      </div>

      {form.tag === '自定义' && (
        <label>
          自定义标签
          <input
            value={customTag}
            onChange={(event) => setCustomTag(event.target.value)}
            placeholder="例如：面试、健身、财务"
          />
        </label>
      )}

      <div className="modal-actions">
        <button className="ghost-button" type="button" onClick={onCancel} disabled={submitting}>
          取消
        </button>
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '保存中...' : initialTodo ? '保存修改' : '创建任务'}
        </button>
      </div>
    </form>
  );
}
