"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Login form with email OTP.
 * Step 1 requests an OTP; Step 2 verifies the OTP and creates a session.
 */
export function LoginForm() {
  const OTP_RESEND_SECONDS = 120;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimerSeconds, setResendTimerSeconds] = useState(0);

  useEffect(() => {
    if (!otpRequested || resendTimerSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendTimerSeconds((previousSeconds) =>
        previousSeconds > 0 ? previousSeconds - 1 : 0,
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [otpRequested, resendTimerSeconds]);

  function formatCountdown(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  async function ensureEmailExists(emailToCheck: string) {
    const response = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToCheck }),
    });

    let result: {
      success?: boolean;
      error?: string;
      exists?: boolean;
      code?: string;
      prismaCode?: string;
    } = {};
    try {
      const text = await response.text();
      if (text) {
        result = JSON.parse(text) as typeof result;
      }
    } catch {
      throw new Error("Could not validate email.");
    }

    if (!response.ok || !result.success) {
      const baseMessage = result.error ?? "Could not validate email.";
      const debugCode = result.code ? ` [${result.code}]` : "";
      const prismaHint = result.prismaCode ? ` (${result.prismaCode})` : "";
      throw new Error(`${baseMessage}${debugCode}${prismaHint}`);
    }

    return Boolean(result.exists);
  }

  async function sendOtpForEmail(emailToUse: string) {
    const { error: otpRequestError } = await authClient.emailOtp.sendVerificationOtp({
      email: emailToUse,
      type: "sign-in",
    });

    if (otpRequestError) {
      throw new Error(otpRequestError.message ?? "Could not send OTP.");
    }
  }

  async function handleRequestOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setRequestingOtp(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const exists = await ensureEmailExists(normalizedEmail);
      if (!exists) {
        const notFoundMessage = "No account found for this email.";
        toast.error(notFoundMessage);
        return;
      }

      await sendOtpForEmail(normalizedEmail);
      setEmail(normalizedEmail);
      setOtpRequested(true);
      setResendTimerSeconds(OTP_RESEND_SECONDS);
      toast.success("Check your email for the 6-digit code.");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not send OTP.";
      toast.error(message);
    } finally {
      setRequestingOtp(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setVerifyingOtp(true);

    const { data, error: signInError } = await authClient.signIn.emailOtp({
      email,
      otp,
    });

    setVerifyingOtp(false);

    if (signInError) {
      toast.error(signInError.message ?? "Invalid OTP.");
      return;
    }

    if (data) {
      toast.success("Signed in successfully");
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-sm border-0 bg-card shadow-lg">
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight text-center">
          Sign in
        </CardTitle>
        <CardDescription className="text-muted-foreground text-center">
          Sign in with a one-time passcode sent to your email
        </CardDescription>
      </CardHeader>
      <form onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={requestingOtp || verifyingOtp || otpRequested}
              className="h-10"
            />
          </div>
          {otpRequested && (
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <Label htmlFor="otp" className="text-center">
                  Enter verification code
                </Label>
                <p className="text-muted-foreground text-sm">
                  Enter the 6-digit code from your inbox
                </p>
              </div>
              <InputOTP
                id="otp"
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={verifyingOtp}
                containerClassName="justify-center"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="h-11 w-11 text-base" />
                  <InputOTPSlot index={1} className="h-11 w-11 text-base" />
                  <InputOTPSlot index={2} className="h-11 w-11 text-base" />
                  <InputOTPSeparator />
                  <InputOTPSlot index={3} className="h-11 w-11 text-base" />
                  <InputOTPSlot index={4} className="h-11 w-11 text-base" />
                  <InputOTPSlot index={5} className="h-11 w-11 text-base" />
                </InputOTPGroup>
              </InputOTP>
              <div className="flex flex-col items-center gap-1">
                <span className="text-muted-foreground text-sm">
                  {resendTimerSeconds > 0
                    ? `Request a new code in ${formatCountdown(resendTimerSeconds)}`
                    : "Didn't receive the code?"}
                </span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-sm font-normal"
                  disabled={requestingOtp || verifyingOtp || resendTimerSeconds > 0}
                  onClick={async () => {
                    setRequestingOtp(true);

                    try {
                      await sendOtpForEmail(email);
                      setResendTimerSeconds(OTP_RESEND_SECONDS);
                      toast.success("A new code has been sent.");
                    } catch (requestError) {
                      const message =
                        requestError instanceof Error
                          ? requestError.message
                          : "Could not resend OTP.";
                      toast.error(message);
                    } finally {
                      setRequestingOtp(false);
                    }
                  }}
                >
                  {requestingOtp ? "Sending..." : "Resend code"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full h-10"
            disabled={
              requestingOtp ||
              verifyingOtp ||
              !email ||
              (otpRequested && otp.length !== 6)
            }
          >
            {requestingOtp || verifyingOtp ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                {otpRequested ? "Verifying..." : "Sending OTP..."}
              </>
            ) : (
              <>{otpRequested ? "Verify OTP" : "Send OTP"}</>
            )}
          </Button>
          {otpRequested && (
            <div className="flex w-full items-center justify-center">
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full"
                disabled={requestingOtp || verifyingOtp}
                onClick={() => {
                  setOtp("");
                  setOtpRequested(false);
                  setResendTimerSeconds(0);
                }}
              >
                Change email
              </Button>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
