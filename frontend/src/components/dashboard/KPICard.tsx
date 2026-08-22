import React from 'react';
import { Card } from '../ui/Card';
import { clsx } from 'clsx';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}) => {
  const iconBg = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  }[color];

  return (
    <Card className="flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className={clsx('p-2 rounded-xl border', iconBg)}>{icon}</div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-foreground tracking-tight">{value}</span>
        {trend && <span className="text-xs font-semibold text-emerald-500">{trend}</span>}
      </div>

      {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
    </Card>
  );
};
