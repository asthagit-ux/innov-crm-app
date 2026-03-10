import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/**
 * Home page with links to login and dashboard.
 * Shows different CTAs based on auth state.
 */
export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Innov CRM
        </h1>
        <p className="text-muted-foreground">
          {session
            ? `Signed in as ${session.user.email}`
            : "Sign in to access the dashboard"}
        </p>
      </div>
      <div className="flex gap-4">
        {session ? (
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
