import type { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  tone: 'blue' | 'green' | 'orange';
};

export default function StatsCard({ title, value, icon: Icon, tone }: StatsCardProps) {
  return (
    <article className={`stats-card stats-card--${tone}`}>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <Icon size={24} />
    </article>
  );
}
