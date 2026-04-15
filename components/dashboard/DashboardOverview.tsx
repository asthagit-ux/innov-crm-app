'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardQuery } from '@/queries/dashboard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TopLeadsPanel, TopLeadsPanelSkeleton } from '@/components/dashboard/TopLeadsPanel';
import { Plus, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function useIndiaDate() {
  return useMemo(() => {
    return new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3.5 w-36" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Skeleton className="h-24 sm:h-28 rounded-xl" />
        <Skeleton className="h-24 sm:h-28 rounded-xl" />
        <Skeleton className="h-24 sm:h-28 rounded-xl" />
      </div>
      {/* Leads skeleton */}
      <TopLeadsPanelSkeleton />
    </div>
  );
}

export function DashboardOverview() {
  const router = useRouter();
  const date = useIndiaDate();
  const user = useAuth();
  const firstName = useMemo(() => {
    const name = (user && typeof user === 'object' && 'name' in user ? String(user.name) : '') || '';
    return name.split(' ')[0] || 'there';
  }, [user]);
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardQuery();
  const summary = data?.summary ?? { totalLeads: 0, hotLeads: 0, activeLeads: 0 };
  const recentLeads = data?.recentLeads ?? [];

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-red-500">
          {error instanceof Error ? error.message : 'Something went wrong while loading the dashboard.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  const onViewAllLeads = () => router.push('/admin/leads');
  const onAddLead = () => router.push('/admin/leads');

  return (
    <div className="space-y-5 sm:space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{date}</p>
          <h1 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight">Hola, {firstName}! 👋</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s your leads snapshot
          </p>
        </div>
        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button size="sm" onClick={onViewAllLeads}>
            View all leads
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <DashboardStats summary={summary} />

      {/* ── Mobile quick actions ── */}
      <div className="flex gap-2 sm:hidden">
        <Button className="flex-1" size="sm" onClick={onAddLead}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Lead
        </Button>
        <Button variant="outline" className="flex-1" size="sm" onClick={onViewAllLeads}>
          All Leads <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>

      {/* ── Recent leads ── */}
      <TopLeadsPanel recentLeads={recentLeads} onViewAll={onViewAllLeads} />
    </div>
  );
}
