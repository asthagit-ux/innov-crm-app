'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { parseMessage } from '@/utils/string.utils';

function formatIndiaDate(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function TopLeadsPanel({
  recentLeads,
  onViewAll,
}: {
  recentLeads: Array<{
    id: string;
    name?: string | null;
    phone?: string | null;
    status?: string | null;
    temperature?: string | null;
    isActive: boolean;
    createdAt?: string | null;
  }>;
  onViewAll: () => void;
}) {
  const hasLeads = useMemo(() => !!recentLeads?.length, [recentLeads]);

  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Top leads</CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasLeads ? (
          <div className="rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
            No leads found yet. Once you add leads, they will appear here.
          </div>
        ) : (
          <div className="mt-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      {lead.name || 'Unnamed lead'}
                      <div className="text-xs text-muted-foreground">
                        {lead.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {lead.phone || '—'}
                    </TableCell>
                    <TableCell>
                      {lead.status ? (
                        <Badge variant="outline">{parseMessage(lead.status)}</Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.temperature ? (
                        <Badge variant="secondary">{parseMessage(lead.temperature)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatIndiaDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Placeholder skeleton while recent leads load.
 */
export function TopLeadsPanelSkeleton() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

