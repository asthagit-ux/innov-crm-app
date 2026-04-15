"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const { authClient } = await import("@/lib/auth-client");
    const { data, error } = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Invalid email or password.");
      return;
    }
    if (data) {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  const canSubmit = !loading && !!email && !!password;

  return (
    <div className="w-full">
      {/* Heading */}
      <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl md:text-3xl">
        Sign in to your account
      </h1>
      <p className="mt-1.5 text-sm text-gray-500">
        Enter your credentials below
      </p>

      <form onSubmit={handleSignIn} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
            inputMode="email"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        {/* Password field */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <span className="text-xs font-medium text-violet-600 cursor-pointer hover:text-violet-700">
              Forgot password?
            </span>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              disabled={loading}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword
                ? <EyeOff className="h-5 w-5" />
                : <Eye className="h-5 w-5" />
              }
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-2 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Signing in…" : "Sign in →"}
        </button>

      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Need access? Contact your administrator.
      </p>
    </div>
  );
}
