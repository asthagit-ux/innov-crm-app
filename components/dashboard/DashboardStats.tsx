'use client';

import { Users, Flame, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function StatCard({
  label,
  value,
  total,
  description,
  icon,
  valueColor,
  iconBg,
  iconColor,
  barColor,
}: {
  label: string;
  value: number;
  total?: number;
  description?: string;
  icon: React.ReactNode;
  valueColor?: string;
  iconBg: string;
  iconColor: string;
  barColor: string;
}) {
  const pct = total != null && total > 0 ? Math.round((value / total) * 100) : null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 sm:p-5">
        {/* Icon + label row */}
        <div className="flex items-center justify-between gap-1">
          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide leading-tight">
            {label}
          </p>
          <span className={`rounded-lg p-1.5 sm:p-2 ${iconBg} ${iconColor} shrink-0`}>
            {icon}
          </span>
        </div>

        {/* Value */}
        <p className={`mt-2 text-2xl sm:text-3xl font-bold tracking-tight ${valueColor ?? ''}`}>
          {value}
        </p>

        {/* Subtext */}
        <p className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">
          {pct !== null ? `${pct}% of total` : (description ?? '')}
        </p>

        {/* Progress bar */}
        {pct !== null && (
          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct > 0 ? Math.max(pct, 4) : 0}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats({
  summary,
}: {
  summary: { totalLeads: number; hotLeads: number; activeLeads: number };
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <StatCard
        label="Total"
        value={summary.totalLeads}
        description="all leads"
        icon={<Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        iconBg="bg-blue-500/10"
        iconColor="text-blue-400"
        barColor="bg-blue-400"
      />
      <StatCard
        label="Hot"
        value={summary.hotLeads}
        total={summary.totalLeads}
        icon={<Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        valueColor="text-orange-400"
        iconBg="bg-orange-500/10"
        iconColor="text-orange-400"
        barColor="bg-orange-400"
      />
      <StatCard
        label="Active"
        value={summary.activeLeads}
        total={summary.totalLeads}
        icon={<Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        valueColor="text-green-400"
        iconBg="bg-green-500/10"
        iconColor="text-green-400"
        barColor="bg-green-400"
      />
    </div>
  );
}
