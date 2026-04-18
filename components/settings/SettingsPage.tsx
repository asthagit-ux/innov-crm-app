'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, UserPlus } from 'lucide-react';

type AppUser = {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
};

export function SettingsPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'USER' as 'ADMIN' | 'USER' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const mapped = d.data.users.map((u: AppUser) => ({
            ...u,
            enabled: true,
          }));
          const saved = localStorage.getItem('team_enabled_users');
          if (saved) {
            const savedIds: string[] = JSON.parse(saved);
            setUsers(mapped.map((u: AppUser) => ({
              ...u,
              enabled: savedIds.includes(u.id),
            })));
          } else {
            setUsers(mapped);
            localStorage.setItem(
              'team_enabled_users',
              JSON.stringify(mapped.map((u: AppUser) => u.id))
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggle = (userId: string) => {
    setSaving(userId);
    const updated = users.map(u =>
      u.id === userId ? { ...u, enabled: !u.enabled } : u
    );
    setUsers(updated);
    const enabledIds = updated.filter(u => u.enabled).map(u => u.id);
    localStorage.setItem('team_enabled_users', JSON.stringify(enabledIds));
    setSaving(null);
  };

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      setAddError('Name and email are required.');
      return;
    }
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUser.name.trim(), email: newUser.email.trim(), role: newUser.role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'Failed to send invite.');
      } else {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', role: 'USER' });
        loadUsers();
      }
    } catch {
      setAddError('Something went wrong.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setDeleting(userId);
    try {
      await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });
      loadUsers();
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your CRM preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">User Management</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Add or remove users. Toggle to control who appears as a collaborator.
              </p>
            </div>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" /> Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            users.map(user => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">
                      {user.enabled ? 'Available' : 'Hidden'}
                    </Label>
                    <Switch
                      checked={user.enabled}
                      onCheckedChange={() => handleToggle(user.id)}
                      disabled={saving === user.id}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDeleteUser(user.id)}
                    disabled={deleting === user.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <p className="text-sm text-muted-foreground">An invite email will be sent. They set their own password when they accept.</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={newUser.name}
                onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                placeholder="e.g. rahul@innovinteriors.com"
                type="email"
                value={newUser.email}
                onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v as 'ADMIN' | 'USER' }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addError && (
              <p className="text-sm text-destructive">{addError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddModal(false); setAddError(''); }}>
              Cancel
            </Button>
            <Button onClick={() => void handleAddUser()} disabled={addLoading || !newUser.name.trim() || !newUser.email.trim()}>
              {addLoading ? 'Sending…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}