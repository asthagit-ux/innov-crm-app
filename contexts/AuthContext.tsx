'use client';

import React, { createContext, useContext } from 'react';
import { authClient } from '@/lib/auth-client';

/**
 * Session user shape used by sidebar components. Loosely typed for better-auth compatibility.
 */
const AuthContext = createContext(null as Record<string, unknown> | null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const value = isPending ? null : user;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
