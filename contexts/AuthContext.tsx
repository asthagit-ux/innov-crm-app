'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export type AuthUser = User & {
  name?: string;
  role?: string;
};

const AuthContext = createContext<AuthUser | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

async function fetchProfile(userId: string): Promise<{ name: string; role: string } | null> {
  try {
    const res = await fetch(`/api/users/profile?id=${userId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  async function loadUser(supabaseUser: User | null) {
    if (!supabaseUser) { setUser(null); return; }
    const profile = await fetchProfile(supabaseUser.id);
    setUser({ ...supabaseUser, name: profile?.name, role: profile?.role });
  }

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => loadUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
