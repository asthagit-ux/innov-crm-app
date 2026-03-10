import Link from "next/link";
import { LayoutGridIcon } from "lucide-react";
import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium text-foreground hover:opacity-80 transition-opacity"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutGridIcon className="size-4" />
          </div>
          Innov CRM
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
