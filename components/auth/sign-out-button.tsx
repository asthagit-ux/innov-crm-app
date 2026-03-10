"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

/**
 * Sign-out button that clears the session and redirects to login.
 */
export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
