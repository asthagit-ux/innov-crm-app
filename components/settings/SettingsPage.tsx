'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

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

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const mapped = d.data.users.map((u: AppUser) => ({
            ...u,
            enabled: true,
          }));
          // Load saved settings from localStorage
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
          <CardTitle className="text-sm">Team Management</CardTitle>
          <p className="text-xs text-muted-foreground">
            Control which users appear as available collaborators when assigning teams to leads.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
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
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}