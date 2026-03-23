import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col">
        <LoginForm />
      </div>
    </div>
  );
}
