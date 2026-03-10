import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth";

/**
 * Protected dashboard page.
 * Auth enforced by middleware; session used for display.
 */
export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <p className="text-muted-foreground">
          Welcome, {session?.user.name ?? session?.user.email}.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
    </div>
  );
}
