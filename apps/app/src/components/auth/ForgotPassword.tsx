"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@featul/auth/client";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Label } from "@featul/ui/components/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@featul/ui/components/opt";
import Link from "next/link";
import { toast } from "sonner";
import { LoadingButton } from "@/components/global/loading-button";
import {
  strongPasswordPattern,
  getPasswordError,
} from "@featul/auth/password";
import { AuthLayout, getAuthLayoutStyles } from "@/components/auth/AuthLayout";
import { resetPassword as resetPasswordOtp } from "../../utils/otp";
import { useOtpVerification } from "@/hooks/useOtpVerification";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function ForgotPassword() {
  const router = useRouter();
  const { safeRedirectParam, redirect } = useAuthRedirect();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"request" | "otp" | "password">("request");
  const styles = getAuthLayoutStyles(false);
  const twoFactorHref = safeRedirectParam
    ? `/auth/two-factor?redirect=${encodeURIComponent(safeRedirectParam)}`
    : "/auth/two-factor";
  const { sendCode: sendResetCode, verifyCode: verifyOtp } = useOtpVerification({
    email,
    code,
    sendNextStep: "otp",
    verifyNextStep: "password",
    sendErrorMessage: "Failed to send reset code",
    sendSuccessMessage: "Reset code sent",
    verifyErrorMessage: "Invalid or expired code",
    resetSubmittedOnSend: true,
    setError,
    setSubmitted,
    setStep,
    setIsSending,
    setIsVerifying,
  });

  const resetPassword = async () => {
    setIsResetting(true);
    setError("");
    setSubmitted(true);

    // Validate password
    const pwdErr = getPasswordError(password);
    if (pwdErr) {
      setError(pwdErr);
      toast.error(pwdErr);
      setIsResetting(false);
      return;
    }

    try {
      // Reset the password with the already-verified OTP
      const { error } = await resetPasswordOtp(email, code, password);
      if (error) {
        // If OTP expired between verify and reset, go back to OTP step
        if (error.message?.toLowerCase().includes("invalid") || error.message?.toLowerCase().includes("expired")) {
          setStep("otp");
          setCode("");
        }
        setError(error.message || "Reset failed");
        toast.error(error.message || "Reset failed");
        return;
      }
      toast.success("Password reset", { duration: 2000 });
      await new Promise((r) => setTimeout(r, 600));
      await authClient.signIn.email(
        { email: email.trim(), password, callbackURL: redirect },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast.info("Please verify your email");
              router.push(
                `/auth/verify?email=${encodeURIComponent(email.trim())}`
              );
              return;
            }
            setError(ctx.error.message);
            toast.error(ctx.error.message);
          },
          onSuccess: (ctx) => {
            if ((ctx as { data?: { twoFactorRedirect?: boolean } })?.data?.twoFactorRedirect) {
              toast.info("Enter your authentication code to finish signing in");
              router.push(twoFactorHref);
              return;
            }
            setTimeout(() => toast.success("Signed in"), 400);
            router.push(redirect);
          },
        }
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Reset failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "request") {
      sendResetCode();
    } else if (step === "otp") {
      verifyOtp();
    } else {
      resetPassword();
    }
  };

  return (
    <AuthLayout
      title="Forgot your password"
      onSubmit={handleSubmit}
      footer={
        <p className="text-accent-foreground text-center text-sm font-normal">
          Remembered your password?
          <Button asChild variant="link" className="px-2 text-primary">
            <Link
              href={
                safeRedirectParam
                  ? `/auth/sign-in?redirect=${encodeURIComponent(safeRedirectParam)}`
                  : "/auth/sign-in"
              }
            >
              Sign in
            </Link>
          </Button>
        </p>
      }
    >
      {/* Step 1: Email Input */}
      {step === "request" && (
        <>
          <div className={styles.fieldSpacingCls}>
            <Label htmlFor="email" className="block text-sm">
              Email
            </Label>
            <Input
              type="email"
              required
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <LoadingButton
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            type="submit"
            loading={isSending}
          >
            Send Reset Code
          </LoadingButton>
        </>
      )}

      {/* Step 2: OTP Verification */}
      {step === "otp" && (
        <div className="space-y-4">
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
              Enter the 6-digit code from your email
            </p>
          </div>

          {submitted && error && (
            <p id="code-error" className="text-destructive text-center text-xs">
              {error}
            </p>
          )}

          <LoadingButton className="w-full" type="submit" loading={isVerifying}>
            Verify Code
          </LoadingButton>
          <LoadingButton
            className="w-full"
            type="button"
            variant="card"
            onClick={sendResetCode}
            loading={isSending}
          >
            Resend Code
          </LoadingButton>
        </div>
      )}

      {/* Step 3: New Password */}
      {step === "password" && (
        <div className="space-y-4">
          <div className={styles.fieldSpacingCls}>
            <Label htmlFor="password" className="block text-sm">
              New Password
            </Label>
            <Input
              type="password"
              required
              id="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="placeholder:text-accent/50"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setSubmitted(false);
                setError("");
              }}
              pattern={strongPasswordPattern}
              title="8+ chars, uppercase, lowercase, number and symbol"
            />
          </div>

          {submitted && error && (
            <p id="password-error" className="text-destructive text-center text-xs">
              {error}
            </p>
          )}

          <LoadingButton className="w-full" type="submit" loading={isResetting}>
            Reset Password
          </LoadingButton>
        </div>
      )}
    </AuthLayout>
  );
}
