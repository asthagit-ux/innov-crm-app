'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, CalendarDays, User, MapPin, Plus } from 'lucide-react';
import { useMeetingsQuery } from '@/queries/meetings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type MeetingItem = {
  id: string;
  agenda: string;
  meetingDate: string;
  user: { id: string; name: string } | null;
  lead: { id: string; customerName: string; contactNumber: string } | null;
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isUpcoming(date: string) {
  return new Date(date).getTime() > Date.now();
}

function isToday(date: string) {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function MeetingsSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

type LeadOption = { id: string; customerName: string };

export function MeetingsOverview() {
  const { data, isLoading, isError, error, refetch } = useMeetingsQuery();
  const [showModal, setShowModal] = useState(false);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [form, setForm] = useState({ leadId: '', agenda: '', meetingDate: '', meetingTime: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/leads?all=1&pageSize=100')
      .then(r => r.json())
      .then(d => { if (d.success) setLeads(d.data.map((l: LeadOption) => ({ id: l.id, customerName: l.customerName }))); })
      .catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.leadId || !form.agenda || !form.meetingDate || !form.meetingTime) return;
    setSubmitting(true);
    try {
      const meetingDate = new Date(`${form.meetingDate}T${form.meetingTime}`).toISOString();
      const res = await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: form.leadId, agenda: form.agenda, meetingDate }),
      });
      if (!res.ok) throw new Error();
      toast.success('Meeting scheduled.');
      setShowModal(false);
      setForm({ leadId: '', agenda: '', meetingDate: '', meetingTime: '' });
      void refetch();
    } catch {
      toast.error('Failed to schedule meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  const allMeetings = (data ?? []) as MeetingItem[];

  // Split into upcoming and past
  const upcoming = allMeetings
    .filter((m) => isUpcoming(m.meetingDate))
    .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime());

  const past = allMeetings
    .filter((m) => !isUpcoming(m.meetingDate))
    .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());

  if (isLoading) return <MeetingsSkeleton />;

  if (isError) {
    return (
      <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm text-red-500">
          {error instanceof Error ? error.message : 'Something went wrong.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Upcoming Meetings */}
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 p-1.5 text-primary">
                <Calendar className="h-4 w-4" />
              </span>
              Upcoming Meetings
              {upcoming.length > 0 && (
                <Badge variant="secondary" className="ml-2">{upcoming.length}</Badge>
              )}
            </CardTitle>
            <Button size="sm" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Schedule Meeting
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming meetings scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Meetings */}
      {past.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <span className="rounded-md bg-muted p-1.5">
                <Calendar className="h-4 w-4" />
              </span>
              Past Meetings
              <Badge variant="outline" className="ml-2">{past.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {past.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} isPast />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Meeting Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lead *</Label>
              <Select value={form.leadId} onValueChange={v => setForm(p => ({ ...p, leadId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a lead" /></SelectTrigger>
                <SelectContent>
                  {leads.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.customerName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agenda *</Label>
              <Input
                placeholder="What is the meeting about?"
                value={form.agenda}
                onChange={e => setForm(p => ({ ...p, agenda: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.meetingDate}
                  onChange={e => setForm(p => ({ ...p, meetingDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={form.meetingTime}
                  onChange={e => setForm(p => ({ ...p, meetingTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              onClick={() => void handleCreate()}
              disabled={submitting || !form.leadId || !form.agenda || !form.meetingDate || !form.meetingTime}
            >
              {submitting ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MeetingCard({ meeting, isPast }: { meeting: MeetingItem; isPast?: boolean }) {
  const today = isToday(meeting.meetingDate);

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
        isPast ? 'opacity-60' : today ? 'border-primary/40 bg-primary/5' : ''
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{meeting.agenda}</p>
          {today && !isPast && (
            <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0">Today</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDateTime(meeting.meetingDate)}
          </span>
          {meeting.lead && (
            <Link
              href={`/admin/leads/${meeting.lead.id}`}
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MapPin className="h-3 w-3" />
              {meeting.lead.customerName}
            </Link>
          )}
          {meeting.user && (
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {meeting.user.name}
            </span>
          )}
        </div>
      </div>
      {meeting.lead && (
        <Link href={`/admin/leads/${meeting.lead.id}`} className="shrink-0">
          <Button variant="outline" size="sm">View Lead</Button>
        </Link>
      )}
    </div>
  );
}
