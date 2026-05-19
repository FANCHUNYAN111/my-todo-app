import { Search } from 'lucide-react';
import type { StatusFilter } from '../types';

type FilterBarProps = {
  search: string;
  tag: string;
  status: StatusFilter;
  tags: string[];
  onSearchChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
};

export default function FilterBar({
  search,
  tag,
  status,
  tags,
  onSearchChange,
  onTagChange,
  onStatusChange,
}: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="任务筛选">
      <label className="search-box">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="搜索标题或描述"
        />
      </label>

      <div className="filter-group">
        <select value={tag} onChange={(event) => onTagChange(event.target.value)}>
          <option value="all">全部标签</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="segmented-control" role="group" aria-label="完成状态">
          {[
            { value: 'all', label: '全部' },
            { value: 'active', label: '未完成' },
            { value: 'completed', label: '已完成' },
          ].map((item) => (
            <button
              key={item.value}
              className={status === item.value ? 'active' : ''}
              type="button"
              onClick={() => onStatusChange(item.value as StatusFilter)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
