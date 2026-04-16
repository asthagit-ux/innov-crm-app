'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadsQuery, useCreateLead } from '@/queries/leads';
import { useUsersQuery } from '@/queries/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Trash2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

const TEMP_EMOJI: Record<string, string> = { HOT: '🔥', WARM: '🌡️', COLD: '❄️' };
const TEMP_COLOR: Record<string, string> = {
  HOT: 'bg-red-500/10 text-red-400 border-red-500/20',
  WARM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  COLD: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};
const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'FOLLOW_UP', label: 'Follow Up' },
  { value: 'NOT_ANSWERED', label: 'Not Answered' },
  { value: 'MEETING_FIXED', label: 'Meeting Fixed' },
  { value: 'CONTACT_IN_FUTURE', label: 'Contact in Future' },
  { value: 'CLOSED_WON', label: 'Closed Won' },
  { value: 'CLOSED_LOST', label: 'Closed Lost' },
  { value: 'JUNK', label: 'Junk' },
];
const ACTIVE_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'HOLD', label: 'Hold' },
];

function LeadsTableSkeleton() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function LeadsTable() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [temperature, setTemperature] = useState('');
  const [activeStatus, setActiveStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newLead, setNewLead] = useState({
    customerName: '',
    contactNumber: '',
    city: '',
    propertyType: 'Banquet Hall',
    budgetRange: '',
    temperature: 'WARM',
    platform: 'Meta Ads',
  });
  const { data: usersData } = useUsersQuery();
  const users = (usersData ?? []) as { id: string; name: string }[];

  const { data: leads = [], isLoading, isError, refetch } = useLeadsQuery({
    search: search || undefined,
    status: status || undefined,
    temperature: temperature || undefined,
    activeStatus: activeStatus || undefined,
  });

  const createLead = useCreateLead();

  const handleAddLead = async () => {
    if (!newLead.customerName || !newLead.contactNumber) return;
    await createLead.mutateAsync({
      ...newLead,
      leadCreatedDate: new Date().toISOString(),
    });
    setShowAddModal(false);
    setNewLead({
      customerName: '',
      contactNumber: '',
      city: '',
      propertyType: 'Banquet Hall',
      budgetRange: '',
      temperature: 'WARM',
      platform: 'Meta Ads',
    });
  };

  const handleDeleteLead = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/leads/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Lead deleted.');
      setDeleteId(null);
      void refetch();
    } catch {
      toast.error('Failed to delete lead.');
    } finally {
      setDeleting(false);
    }
  };

  const handleInlineUpdate = async (id: string, field: string, value: string) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    void refetch();
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track your leads</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:contents">
          <Select value={temperature || 'ALL'} onValueChange={v => setTemperature(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Temp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Temps</SelectItem>
              <SelectItem value="HOT">🔥 Hot</SelectItem>
              <SelectItem value="WARM">🌡️ Warm</SelectItem>
              <SelectItem value="COLD">❄️ Cold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status || 'ALL'} onValueChange={v => setStatus(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={activeStatus || 'ALL'} onValueChange={v => setActiveStatus(v === 'ALL' ? '' : v)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Active</SelectItem>
              {ACTIVE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        {isLoading ? 'Loading...' : `${leads.length} lead${leads.length !== 1 ? 's' : ''} found`}
      </p>

      {/* ── Content ── */}
      {isLoading ? (
        <LeadsTableSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-red-500">
          Failed to load leads.{' '}
          <button className="underline" onClick={() => refetch()}>Try again</button>
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          No leads found. Add your first lead!
        </div>
      ) : (
        <>
          {/* ── Mobile card list (hidden md+) ── */}
          <div className="md:hidden space-y-2">
            {leads.map((lead: Record<string, unknown>) => {
              const temp = lead.temperature as string;
              const leadStatus = lead.status as string;
              const active = lead.activeStatus as string;
              return (
                <Card
                  key={lead.id as string}
                  className="overflow-hidden gap-0 py-0 cursor-pointer transition-colors hover:bg-muted/30 active:bg-muted/50"
                  onClick={() => router.push(`/admin/leads/${lead.id}`)}
                >
                  <CardContent className="p-4">
                    {/* Row 1: name + temp + delete */}
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight truncate">
                          {(lead.customerName as string) || 'Unnamed lead'}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {(lead.contactNumber as string) || '—'}
                          {(lead.city as string) && (
                            <span className="before:mx-1.5 before:content-['·']">{lead.city as string}</span>
                          )}
                        </p>
                        <div className="mt-0.5" onClick={e => e.stopPropagation()}>
                          <Select
                            value={((lead.assignedUser as Record<string, string> | null)?.id) || '__none__'}
                            onValueChange={v => handleInlineUpdate(lead.id as string, 'assignedTo', v === '__none__' ? '' : v)}
                          >
                            <SelectTrigger className="h-6 w-auto border-0 bg-transparent p-0 text-xs text-muted-foreground focus:ring-0 gap-1">
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Unassigned</SelectItem>
                              {users.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {temp && (
                          <span className={`rounded-md border px-1.5 py-0.5 text-xs font-medium ${TEMP_COLOR[temp] ?? ''}`}>
                            {TEMP_EMOJI[temp]} {temp.charAt(0) + temp.slice(1).toLowerCase()}
                          </span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteId(lead.id as string); }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Delete lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: property + source */}
                    {((lead.propertyType as string) || (lead.platform as string)) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {(lead.propertyType as string) && (
                          <span className="text-xs text-muted-foreground">{lead.propertyType as string}</span>
                        )}
                        {(lead.platform as string) && (
                          <Badge variant="outline" className="text-xs">{lead.platform as string}</Badge>
                        )}
                      </div>
                    )}

                    {/* Row 3: inline status selects + nav arrow */}
                    <div className="mt-3 flex items-center gap-2">
                      <div
                        className="flex flex-1 flex-wrap items-center gap-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <Select
                          value={leadStatus || ''}
                          onValueChange={v => handleInlineUpdate(lead.id as string, 'status', v)}
                        >
                          <SelectTrigger className="h-7 w-auto min-w-[110px] border-dashed text-xs">
                            <SelectValue placeholder="Set status..." />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select
                          value={active || ''}
                          onValueChange={v => handleInlineUpdate(lead.id as string, 'activeStatus', v)}
                        >
                          <SelectTrigger className="h-7 w-auto min-w-[90px] border-dashed text-xs">
                            <SelectValue placeholder="Active..." />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTIVE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ── Desktop table (hidden below md) ── */}
          <Card className="hidden md:block py-0 gap-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="table-fixed min-w-[1200px] [&_th:first-child]:pl-6 [&_td:first-child]:pl-6 [&_th:last-child]:pr-6 [&_td:last-child]:pr-6 [&_th]:h-9">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Customer</TableHead>
                      <TableHead className="w-[140px]">Phone</TableHead>
                      <TableHead className="w-[130px]">Assignee</TableHead>
                      <TableHead className="w-[150px]">Status</TableHead>
                      <TableHead className="w-[90px]">Temp</TableHead>
                      <TableHead className="w-[110px]">City</TableHead>
                      <TableHead className="w-[130px]">Property</TableHead>
                      <TableHead className="w-[180px]">Source</TableHead>
                      <TableHead className="w-[150px]">Created</TableHead>
                      <TableHead className="w-[110px]">Active</TableHead>
                      <TableHead className="w-[48px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead: Record<string, unknown>) => (
                      <TableRow
                        key={lead.id as string}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/admin/leads/${lead.id}`)}
                      >
                        <TableCell className="font-medium truncate max-w-0">{(lead.customerName as string) || '—'}</TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-0">{(lead.contactNumber as string) || '—'}</TableCell>
                        <TableCell onClick={e => e.stopPropagation()}>
                          <Select
                            value={((lead.assignedUser as Record<string, string> | null)?.id) || '__none__'}
                            onValueChange={v => handleInlineUpdate(lead.id as string, 'assignedTo', v === '__none__' ? '' : v)}
                          >
                            <SelectTrigger className="h-7 w-full border-0 bg-transparent p-0 text-xs focus:ring-0">
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Unassigned</SelectItem>
                              {users.map(u => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell onClick={e => e.stopPropagation()}>
                          <Select
                            value={(lead.status as string) || ''}
                            onValueChange={v => handleInlineUpdate(lead.id as string, 'status', v)}
                          >
                            <SelectTrigger className="h-7 w-full border-0 bg-transparent p-0 text-xs focus:ring-0">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell onClick={e => e.stopPropagation()}>
                          <Select
                            value={(lead.temperature as string) || ''}
                            onValueChange={v => handleInlineUpdate(lead.id as string, 'temperature', v)}
                          >
                            <SelectTrigger className="h-7 w-full border-0 bg-transparent p-0 text-xs focus:ring-0">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HOT">🔥 Hot</SelectItem>
                              <SelectItem value="WARM">🌡️ Warm</SelectItem>
                              <SelectItem value="COLD">❄️ Cold</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="text-muted-foreground truncate max-w-0">{(lead.city as string) || '—'}</TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-0">{(lead.propertyType as string) || '—'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {(lead.leadSource as string) && (
                              <span className="text-sm text-muted-foreground truncate">{lead.leadSource as string}</span>
                            )}
                            {(lead.platform as string) && (
                              <Badge variant="outline" className="text-xs shrink-0">
                                {lead.platform as string}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground text-xs">{formatDateTime(lead.createdAt as string)}</TableCell>

                        <TableCell onClick={e => e.stopPropagation()}>
                          <Select
                            value={(lead.activeStatus as string) || ''}
                            onValueChange={v => handleInlineUpdate(lead.id as string, 'activeStatus', v)}
                          >
                            <SelectTrigger className="h-7 w-full border-0 bg-transparent p-0 text-xs focus:ring-0">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTIVE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell onClick={e => e.stopPropagation()} className="text-right">
                          <button
                            onClick={() => setDeleteId(lead.id as string)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Delete confirm dialog ── */}
      <Dialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this lead? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteLead} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add lead dialog ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer Name *</Label>
              <Input value={newLead.customerName} onChange={e => setNewLead(p => ({ ...p, customerName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={newLead.contactNumber} onChange={e => setNewLead(p => ({ ...p, contactNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={newLead.city} onChange={e => setNewLead(p => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Budget Range</Label>
              <Input value={newLead.budgetRange} onChange={e => setNewLead(p => ({ ...p, budgetRange: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={newLead.propertyType} onValueChange={v => setNewLead(p => ({ ...p, propertyType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Banquet Hall', 'Resort / Farmhouse', 'Residential', 'Hotel', 'Other'].map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Select value={newLead.temperature} onValueChange={v => setNewLead(p => ({ ...p, temperature: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOT">🔥 Hot</SelectItem>
                  <SelectItem value="WARM">🌡️ Warm</SelectItem>
                  <SelectItem value="COLD">❄️ Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddLead} disabled={createLead.isPending}>
              {createLead.isPending ? 'Saving...' : 'Save Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
