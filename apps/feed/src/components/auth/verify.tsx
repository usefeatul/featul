"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@feedgot/auth/client";
import { Button } from "@feedgot/ui/components/button";
import { Input } from "@feedgot/ui/components/input";
import { Label } from "@feedgot/ui/components/label";
import Link from "next/link";
import { toast } from "sonner";
import { LoadingButton } from "@/components/loading-button";

export default function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const resend = async () => {
    setIsResending(true);
    setError("");
    setInfo("");
    setSubmitted(false);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: email.trim(),
        type: "email-verification",
      });
      setInfo("Verification code sent");
      toast.success("Verification code sent");
    } catch (e: any) {
      setError(e?.message || "Failed to send code");
      toast.error(e?.message || "Failed to send code");
    } finally {
      setIsResending(false);
    }
  };

  const verify = async () => {
    setIsVerifying(true);
    setError("");
    setInfo("");
    setSubmitted(true);
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: email.trim(),
        otp: code.trim(),
      });
      if (error) {
        setError(error.message || "Verification failed");
        toast.error(error.message);
        return;
      }
      toast.success("Email verified");
      router.push("/start");
    } catch (e: any) {
      setError(e?.message || "Invalid or expired code");
      toast.error(e?.message || "Invalid or expired code");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <form
        noValidate
        className="bg-background m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
        onSubmit={(e) => {
          e.preventDefault();
          verify();
        }}
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-6 sm:p-8 pb-5 sm:pb-6">
          <div className="text-left">
            <h1 className="mb-2 mt-4 text-xl sm:text-2xl font-semibold text-left">
              Verify your email
            </h1>
            <p className="text-xs sm:text-sm text-accent mb-2 text-left">
              Enter the code sent to your email
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input
                type="email"
                required
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="placeholder:text-accent/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="block text-sm">
                Verification Code
              </Label>
              <Input
                type="text"
                required
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                pattern="^[0-9]{6}$"
                title="Enter the 6-digit code"
                autoComplete="one-time-code"
                placeholder="123456"
                className="placeholder:text-accent/50"
                aria-invalid={submitted && Boolean(error)}
                aria-describedby={submitted && error ? "code-error" : undefined}
              />
              {submitted && error && (
                <p id="code-error" className="text-destructive text-xs">
                  {error}
                </p>
              )}
              {info && <p className="text-xs">{info}</p>}
            </div>

            <LoadingButton
              className="w-full"
              type="submit"
              loading={isVerifying}
            >
              Verify
            </LoadingButton>
            <LoadingButton
              className="w-full"
              type="button"
              variant="outline"
              onClick={resend}
              loading={isResending}
            >
              Resend Code
            </LoadingButton>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm sm:text-base">
            Already verified?
            <Button asChild variant="link" className="px-2">
              <Link href="/auth/sign-in">Sign in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
