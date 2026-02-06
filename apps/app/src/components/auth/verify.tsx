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
import { AuthLayout, getAuthLayoutStyles } from "@/components/auth/AuthLayout";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Verify() {
  const router = useRouter();
  const params = useSearchParams();
  const { safeRedirectParam, redirect } = useAuthRedirect();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const styles = getAuthLayoutStyles(false);

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
    <AuthLayout
      title="Verify your email"
      onSubmit={(e) => {
        e.preventDefault();
        verify();
      }}
      footer={
        <p className="text-accent-foreground text-center text-sm font-normal">
          Already verified?
          <Button asChild variant="link" className="px-2 text-primary">
            <Link
              href={
                safeRedirectParam
                  ? `/auth/sign-in?redirect=${encodeURIComponent(
                      safeRedirectParam
                    )}`
                  : "/auth/sign-in"
              }
            >
              Sign in
            </Link>
          </Button>
        </p>
      }
    >
      <div className={styles.fieldSpacingCls}>
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
        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        type="submit"
        loading={isVerifying}
      >
        Verify
      </LoadingButton>
      <LoadingButton
        className="w-full"
        type="button"
        variant="card"
        onClick={resend}
        loading={isResending}
      >
        Resend code
      </LoadingButton>
    </AuthLayout>
  );
}
