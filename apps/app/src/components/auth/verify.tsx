"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@featul/ui/components/opt";
import Link from "next/link";
import { toast } from "sonner";
import { LoadingButton } from "@/components/global/loading-button";
import { sendVerificationOtp, verifyEmail } from "../../utils/otp-utils";

export default function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const rawRedirect = params.get("redirect") || "";
  const redirect = rawRedirect.startsWith("/") ? rawRedirect : "/start";
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
      const { error } = await sendVerificationOtp(email, "email-verification");
      if (error) {
        setError(error.message || "Failed to send code");
        toast.error(error.message || "Failed to send code");
        return;
      }
      setInfo("Verification code sent");
      toast.success("Verification code sent");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send code";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const verify = async () => {
    setIsVerifying(true);
    setError("");
    setInfo("");
    setSubmitted(true);

    if (code.trim().length !== 6) {
      setError("Please enter the 6-digit code.");
      setIsVerifying(false);
      return;
    }
    try {
      const { error } = await verifyEmail(email, code);
      if (error) {
        setError(error.message || "Verification failed");
        toast.error(error.message || "Verification failed");
        return;
      }
      toast.success("Email verified");
      router.push(redirect);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid or expired code";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <form
        noValidate
        className="bg-background m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border border-border dark:[--color-muted:var(--color-zinc-900)] ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black"
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
            <div className="space-y-3">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={(value) => {
                  setCode(value);
                  setSubmitted(false);
                  setError("");
                }}
                containerClassName="justify-center gap-2"
                aria-label="One-time password"
                aria-invalid={submitted && Boolean(error)}
                aria-describedby={submitted && error ? "code-error" : undefined}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="h-10 w-9 text-base"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <p className="text-xs text-accent text-center">
                Enter your one-time password.
              </p>
              {submitted && error && (
                <p id="code-error" className="text-destructive text-xs">
                  {error}
                </p>
              )}
              {info && <p className="text-xs text-muted-foreground">{info}</p>}
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
              Resend code
            </LoadingButton>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm sm:text-base">
            Already verified?
            <Button asChild variant="link" className="px-2">
              <Link
                href={
                  rawRedirect
                    ? `/auth/sign-in?redirect=${encodeURIComponent(
                      rawRedirect,
                    )}`
                    : "/auth/sign-in"
                }
              >
                Sign in
              </Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
