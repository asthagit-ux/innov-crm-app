'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardQuery } from '@/queries/dashboard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TopLeadsPanel, TopLeadsPanelSkeleton } from '@/components/dashboard/TopLeadsPanel';

function useIndiaGreeting() {
  return useMemo(() => {
    const nowInIndia = new Date(
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    );
    const hour = nowInIndia.getHours();

    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }, []);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>

      <TopLeadsPanelSkeleton />
    </div>
  );
}

export function DashboardOverview() {
  const router = useRouter();
  const greeting = useIndiaGreeting();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardQuery();

  const summary = data?.summary || {
    totalLeads: 0,
    hotLeads: 0,
    activeLeads: 0,
  };

  const recentLeads = data?.recentLeads || [];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-red-500">
          {error instanceof Error
            ? error.message
            : 'Something went wrong while loading the dashboard.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const onViewAllLeads = () => router.push('/admin/leads');

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{greeting}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Leads overview for today (preview).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button size="sm" onClick={onViewAllLeads}>
            View all leads
          </Button>
        </div>
      </div>

      <DashboardStats summary={summary} />

      <TopLeadsPanel recentLeads={recentLeads} onViewAll={onViewAllLeads} />
    </div>
  );
}

