"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      {/* Title */}
      <h1 style={{
        fontSize: "2.75rem",
        fontWeight: 800,
        color: "#1f2937",
        lineHeight: 1.15,
        marginBottom: "0.75rem",
      }}>
        Sign in to your account
      </h1>
      <p style={{ fontSize: "1rem", color: "#9ca3af", marginBottom: "2.5rem" }}>
        Enter your credentials to access Innov CRM
      </p>

      <form onSubmit={handleSignIn}>
        {/* Email */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{
            display: "block",
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "#374151",
            marginBottom: "0.5rem",
          }}>
            Email
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
            style={{
              width: "100%",
              padding: "0.875rem 1rem",
              fontSize: "1rem",
              backgroundColor: "#eef2ff",
              border: "none",
              borderRadius: "10px",
              outline: "none",
              color: "#1f2937",
              boxSizing: "border-box",
              transition: "box-shadow 0.2s",
            }}
            onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"}
            onBlur={e => e.target.style.boxShadow = "none"}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <label style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#374151" }}>
              Password
            </label>
            <span style={{ fontSize: "0.875rem", color: "#7c3aed", fontWeight: 500, cursor: "pointer" }}>
              Forgot password?
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "0.875rem 3rem 0.875rem 1rem",
                fontSize: "1rem",
                backgroundColor: "#eef2ff",
                border: "none",
                borderRadius: "10px",
                outline: "none",
                color: "#1f2937",
                boxSizing: "border-box",
                transition: "box-shadow 0.2s",
              }}
              onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"}
              onBlur={e => e.target.style.boxShadow = "none"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              disabled={loading}
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 14.5c-2.48 0-4.5-2.02-4.5-4.5S7.52 5.5 10 5.5 14.5 7.52 14.5 10 12.48 14.5 10 14.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                  <path d="M2.5 2.5L17.5 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 14.5c-2.48 0-4.5-2.02-4.5-4.5S7.52 5.5 10 5.5 14.5 7.52 14.5 10 12.48 14.5 10 14.5zm0-7.5c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading || !email || !password}
          style={{
            width: "100%",
            padding: "0.9375rem 1.5rem",
            fontSize: "1rem",
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: loading || !email || !password ? "#9ca3af" : "#6b7280",
            border: "none",
            borderRadius: "10px",
            cursor: loading || !email || !password ? "not-allowed" : "pointer",
            marginTop: "0.5rem",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={e => { if (!loading && email && password) (e.target as HTMLButtonElement).style.backgroundColor = "#4b5563"; }}
          onMouseLeave={e => { if (!loading && email && password) (e.target as HTMLButtonElement).style.backgroundColor = "#6b7280"; }}
        >
          {loading ? "Signing in..." : "Sign in →"}
        </button>
      </form>

      <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#9ca3af", textAlign: "center" }}>
        Need access? Contact your administrator.
      </p>
    </div>
  );
}
