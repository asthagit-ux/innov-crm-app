'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get('next') ?? '/admin/dashboard';

    // PKCE flow: exchange the code for a session server-side style but on client
    const code = searchParams.get('code');
    if (code) {
      void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? '/login?error=reset_failed' : next);
      });
      return;
    }

    // Implicit / magic-link flow: Supabase detects the session from the URL hash
    // automatically via detectSessionInUrl (default true). We just wait for the event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY')) {
        subscription.unsubscribe();
        router.replace(next);
      }
    });

    // Safety timeout in case no auth event fires
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.replace('/login?error=reset_failed');
    }, 5000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-svh items-center justify-center">
      <p className="text-sm text-muted-foreground">Verifying…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
