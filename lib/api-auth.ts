import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/** Returns the authenticated user or a 401 response. */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, response: null };
}

/** Returns the authenticated user with their role ('ADMIN' | 'USER'), or a 401. */
export async function requireAuthWithRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, role: null as never, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { rolePermission: { select: { role: true } } },
  });
  const role = (dbUser?.rolePermission.role ?? 'USER') as 'ADMIN' | 'USER';
  return { user, role, response: null };
}

/** Supabase Admin client (service role) — for server-side user management. */
export function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
