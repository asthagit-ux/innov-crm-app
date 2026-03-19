'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Flame, Activity } from 'lucide-react';

function StatCard({
  label,
  value,
  icon,
  tone = 'default',
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
  tone?: 'default' | 'accent';
}) {
  const isAccent = tone === 'accent';

  return (
    <Card
      className={
        isAccent
          ? 'border-primary/20 bg-linear-to-br from-primary/5 via-background to-background'
          : undefined
      }
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon ? (
          <span
            className={
              isAccent
                ? 'rounded-full bg-primary/10 p-2 text-primary'
                : 'rounded-full bg-muted p-2 text-muted-foreground'
            }
          >
            {icon}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
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
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Total leads" value={summary.totalLeads} icon={<Users className="h-4 w-4" />} />
      <StatCard
        label="Hot leads"
        value={summary.hotLeads}
        icon={<Flame className="h-4 w-4" />}
        tone="accent"
      />
      <StatCard label="Active leads" value={summary.activeLeads} icon={<Activity className="h-4 w-4" />} />
    </div>
  );
}

