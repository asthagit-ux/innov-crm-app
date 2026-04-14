'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadsQuery, useCreateLead } from '@/queries/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Trash2 } from 'lucide-react';
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

function LeadsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track your leads</p>
        </div>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={temperature || 'ALL'} onValueChange={v => setTemperature(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Temperature" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Temps</SelectItem>
            <SelectItem value="HOT">🔥 Hot</SelectItem>
            <SelectItem value="WARM">🌡️ Warm</SelectItem>
            <SelectItem value="COLD">❄️ Cold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status || 'ALL'} onValueChange={v => setStatus(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
            <SelectItem value="NOT_ANSWERED">Not Answered</SelectItem>
            <SelectItem value="MEETING_FIXED">Meeting Fixed</SelectItem>
            <SelectItem value="CONTACT_IN_FUTURE">Contact in Future</SelectItem>
            <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
            <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
            <SelectItem value="JUNK">Junk</SelectItem>
          </SelectContent>
        </Select>
        <Select value={activeStatus || 'ALL'} onValueChange={v => setActiveStatus(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Active Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Active</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="HOLD">Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm font-medium text-muted-foreground">
        {isLoading ? 'Loading...' : `${leads.length} lead${leads.length !== 1 ? 's' : ''} found`}
      </p>

      <Card className="py-0 gap-0 overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <LeadsTableSkeleton />
          ) : isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-red-500">
              Failed to load leads.{' '}
              <button className="underline" onClick={() => refetch()}>Try again</button>
            </div>
          ) : leads.length === 0 ? (
            <div className="rounded-lg border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No leads found. Add your first lead!
            </div>
          ) : (
            <Table className="table-fixed w-full [&_th:first-child]:pl-6 [&_td:first-child]:pl-6 [&_th:last-child]:pr-6 [&_td:last-child]:pr-6 [&_th]:h-9">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Customer</TableHead>
                  <TableHead className="w-[140px]">Phone</TableHead>
                  <TableHead className="w-[110px]">City</TableHead>
                  <TableHead className="w-[130px]">Property</TableHead>
                  <TableHead className="w-[180px]">Source</TableHead>
                  <TableHead className="w-[90px]">Temp</TableHead>
                  <TableHead className="w-[150px]">Status</TableHead>
                  <TableHead className="w-[110px]">Active</TableHead>
                  <TableHead className="w-[150px] text-right">Created</TableHead>
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

                    <TableCell onClick={e => e.stopPropagation()}>
                      <Select
                        value={(lead.status as string) || ''}
                        onValueChange={v => handleInlineUpdate(lead.id as string, 'status', v)}
                      >
                        <SelectTrigger className="h-7 w-full border-0 bg-transparent p-0 text-xs focus:ring-0">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                          <SelectItem value="NOT_ANSWERED">Not Answered</SelectItem>
                          <SelectItem value="MEETING_FIXED">Meeting Fixed</SelectItem>
                          <SelectItem value="CONTACT_IN_FUTURE">Contact in Future</SelectItem>
                          <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                          <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                          <SelectItem value="JUNK">Junk</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell onClick={e => e.stopPropagation()}>
                      <Select
                        value={(lead.activeStatus as string) || ''}
                        onValueChange={v => handleInlineUpdate(lead.id as string, 'activeStatus', v)}
                      >
                        <SelectTrigger className="h-7 w-full border-0 bg-transparent p-0 text-xs focus:ring-0">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="HOLD">Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-right text-muted-foreground text-xs">{formatDateTime(lead.createdAt as string)}</TableCell>
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
          )}
        </CardContent>
      </Card>

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

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
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
