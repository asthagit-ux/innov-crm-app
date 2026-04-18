import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-muted/30 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Innov CRM</h1>
        <p className="text-muted-foreground">
          {user ? `Signed in as ${user.email}` : "Sign in to access the dashboard"}
        </p>
      </div>
      <div className="flex gap-4">
        {user ? (
          <Button asChild><Link href="/admin/dashboard">Dashboard</Link></Button>
        ) : (
          <Button asChild><Link href="/login">Sign in</Link></Button>
        )}
      </div>
    </div>
  );
}
