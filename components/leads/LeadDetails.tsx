'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadQuery, useUpdateLead, useAddComment, useScheduleMeeting } from '@/queries/leads';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Calendar } from 'lucide-react';

function formatDate(value: string | null | undefined) {
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

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LeadDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: lead, isLoading, refetch } = useLeadQuery(id);
  const updateLead = useUpdateLead(id);
  const addComment = useAddComment(id);
  const scheduleMeeting = useScheduleMeeting(id);

  const [comment, setComment] = useState('');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ agenda: '', meetingDate: '', meetingTime: '' });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button variant="outline" onClick={() => router.push('/admin/leads')}>
          Back to Leads
        </Button>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm({
      customerName: (lead.customerName as string) || '',
      contactNumber: (lead.contactNumber as string) || '',
      email: (lead.email as string) || '',
      city: (lead.city as string) || '',
      state: (lead.state as string) || '',
      propertyType: (lead.propertyType as string) || '',
      briefScope: (lead.briefScope as string) || '',
      budgetRange: (lead.budgetRange as string) || '',
      requirement: (lead.requirement as string) || '',
      initialNotes: (lead.initialNotes as string) || '',
      leadSource: (lead.leadSource as string) || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    await updateLead.mutateAsync(editForm);
    setEditing(false);
    void refetch();
  };

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    await addComment.mutateAsync({ content: comment.trim(), type: 'note' });
    setComment('');
    void refetch();
  };

  const handleScheduleMeeting = async () => {
    if (!meetingForm.agenda || !meetingForm.meetingDate || !meetingForm.meetingTime) return;
    const meetingDate = new Date(`${meetingForm.meetingDate}T${meetingForm.meetingTime}`).toISOString();
    await scheduleMeeting.mutateAsync({ agenda: meetingForm.agenda, meetingDate });
    setShowMeetingModal(false);
    setMeetingForm({ agenda: '', meetingDate: '', meetingTime: '' });
    void refetch();
  };

  const comments = (lead.comments as Record<string, unknown>[]) || [];
  const meetings = (lead.meetings as Record<string, unknown>[]) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/leads')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight flex-1">
          {lead.customerName as string}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowMeetingModal(true)}>
            <Calendar className="h-4 w-4 mr-2" /> Schedule Meeting
          </Button>
          {!editing ? (
            <Button size="sm" onClick={handleEdit}>Edit Lead</Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={updateLead.isPending}>
                {updateLead.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Lead Info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {editing ? (
                <>
                  {[
                    { key: 'customerName', label: 'Customer Name' },
                    { key: 'contactNumber', label: 'Phone' },
                    { key: 'email', label: 'Email' },
                    { key: 'city', label: 'City' },
                    { key: 'state', label: 'State' },
                    { key: 'propertyType', label: 'Property Type' },
                    { key: 'budgetRange', label: 'Budget Range' },
                    { key: 'leadSource', label: 'Lead Source' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{label}</Label>
                      <Input
                        value={editForm[key] || ''}
                        onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="col-span-full space-y-1">
                    <Label className="text-xs text-muted-foreground">Requirement / Brief Scope</Label>
                    <Textarea
                      value={editForm.briefScope || ''}
                      onChange={e => setEditForm(p => ({ ...p, briefScope: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="col-span-full space-y-1">
                    <Label className="text-xs text-muted-foreground">Remarks / Initial Notes</Label>
                    <Textarea
                      value={editForm.initialNotes || ''}
                      onChange={e => setEditForm(p => ({ ...p, initialNotes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  {[
                    { label: 'Customer Name', value: lead.customerName as string },
                    { label: 'Phone', value: lead.contactNumber as string },
                    { label: 'Email', value: lead.email as string },
                    { label: 'City', value: lead.city as string },
                    { label: 'State', value: lead.state as string },
                    { label: 'Property Type', value: lead.propertyType as string },
                    { label: 'Budget Range', value: lead.budgetRange as string },
                    { label: 'Lead Source', value: (lead.leadSource as string) || (lead.platform as string) },
                    { label: 'Created Date', value: formatDate(lead.leadCreatedDate as string) },
                    { label: 'Follow Up Date', value: formatDate(lead.followUpDate as string) },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value || '—'}</p>
                    </div>
                  ))}
                  <div className="col-span-full space-y-1">
                    <p className="text-xs text-muted-foreground">Requirement / Brief Scope</p>
                    <p className="text-sm">{(lead.briefScope as string) || (lead.requirement as string) || '—'}</p>
                  </div>
                  <div className="col-span-full space-y-1">
                    <p className="text-xs text-muted-foreground">Remarks / Initial Notes</p>
                    <p className="text-sm">{(lead.initialNotes as string) || '—'}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Temperature</Label>
                <Select
                  value={(lead.temperature as string) || ''}
                  onValueChange={v => updateLead.mutate({ temperature: v })}
                >
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOT">🔥 Hot</SelectItem>
                    <SelectItem value="WARM">🌡️ Warm</SelectItem>
                    <SelectItem value="COLD">❄️ Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Lead Status</Label>
                <Select
                  value={(lead.status as string) || ''}
                  onValueChange={v => updateLead.mutate({ status: v })}
                >
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                    <SelectItem value="NOT_ANSWERED">Not Answered</SelectItem>
                    <SelectItem value="MEETING_FIXED">Meeting Fixed</SelectItem>
                    <SelectItem value="CONTACT_IN_FUTURE">Contact in Future</SelectItem>
                    <SelectItem value="CLOSED_WON">Closed Won ✅</SelectItem>
                    <SelectItem value="CLOSED_LOST">Closed Lost ❌</SelectItem>
                    <SelectItem value="JUNK">Junk 🗑️</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Active Status</Label>
                <Select
                  value={(lead.activeStatus as string) || ''}
                  onValueChange={v => updateLead.mutate({ activeStatus: v })}
                >
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="HOLD">Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Meetings */}
          {meetings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Scheduled Meetings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {meetings.map((meeting) => (
                  <div key={meeting.id as string} className="flex items-start justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{meeting.agenda as string}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        📅 {formatDateTime(meeting.meetingDate as string)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — WhatsApp-style Chat Box */}
        <div className="flex flex-col" style={{ height: '600px' }}>
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-2 border-b flex-shrink-0">
              <CardTitle className="text-sm">Comments & Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {comments.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-8">
                  No comments yet. Add the first one!
                </p>
              )}
              {[...comments].reverse().map((c) => {
                const user = c.user as Record<string, string> | null;
                return (
                  <div key={c.id as string} className="flex flex-col gap-1 items-start">
                    <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-3 py-2 max-w-[85%]">
                      <p className="text-sm leading-relaxed">{c.content as string}</p>
                    </div>
                    <p className="text-xs text-muted-foreground px-1">
                      {user?.name || 'System'} · {formatDateTime(c.createdAt as string)}
                    </p>
                  </div>
                );
              })}
            </CardContent>
            <div className="p-3 border-t flex gap-2 flex-shrink-0">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendComment();
                  }
                }}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => void handleSendComment()}
                disabled={addComment.isPending || !comment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <Dialog open={showMeetingModal} onOpenChange={setShowMeetingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Agenda *</Label>
              <Input
                placeholder="What is the meeting about?"
                value={meetingForm.agenda}
                onChange={e => setMeetingForm(p => ({ ...p, agenda: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={meetingForm.meetingDate}
                  onChange={e => setMeetingForm(p => ({ ...p, meetingDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={meetingForm.meetingTime}
                  onChange={e => setMeetingForm(p => ({ ...p, meetingTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMeetingModal(false)}>Cancel</Button>
            <Button
              onClick={() => void handleScheduleMeeting()}
              disabled={scheduleMeeting.isPending || !meetingForm.agenda || !meetingForm.meetingDate || !meetingForm.meetingTime}
            >
              {scheduleMeeting.isPending ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}