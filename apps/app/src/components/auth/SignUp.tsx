"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@featul/auth/client";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Label } from "@featul/ui/components/label";
import Link from "next/link";
import { toast } from "sonner";
import {
  strongPasswordPattern,
  getPasswordError,
} from "@featul/auth/password";
import { LoadingButton } from "@/components/global/LoadingButton";
import { AuthLayout, getAuthLayoutStyles } from "@/components/auth/AuthLayout";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";

export default function SignUp({
  redirectTo,
  embedded = false,
  onSwitchMode,
}: {
  redirectTo?: string;
  embedded?: boolean;
  onSwitchMode?: () => void;
} = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { safeRedirectParam, redirect } = useAuthRedirect(redirectTo);
  const styles = getAuthLayoutStyles(embedded);
  const { onGoogle, onGithub } = useSocialAuth({
    redirect,
    setIsLoading,
    setError,
    errorMessages: {
      google: "Failed with Google",
      github: "Failed with GitHub",
    },
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSubmitted(true);
    try {
      const msg = getPasswordError(password);
      if (msg) {
        toast.error(msg);
        setError(msg);
        return;
      }
      const displayName = email.trim().split("@")[0] || email.trim();
      await authClient.signUp.email({
        name: displayName,
        email: email.trim(),
        password,
        callbackURL: `/auth/verify?email=${encodeURIComponent(email.trim())}${safeRedirectParam ? `&redirect=${encodeURIComponent(safeRedirectParam)}` : ""}`,
      });
      captureAnalyticsEvent(analyticsEvents.authMethodUsed, {
        method: "email",
        intent: "sign_up",
        stage: "completed",
      });
      captureAnalyticsEvent(analyticsEvents.signUpCompleted, {
        method: "email",
      });
      captureAnalyticsEvent(analyticsEvents.emailVerificationRequired, {
        source: "sign_up",
      });
      toast.success("Account created. Check your email for the code");
      router.push(`/auth/verify?email=${encodeURIComponent(email)}${safeRedirectParam ? `&redirect=${encodeURIComponent(safeRedirectParam)}` : ""}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to sign up";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      embedded={embedded}
      title="Sign up to featul"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      footer={
        <p className={styles.footerTextCls}>
          Already have an account?
          {embedded && onSwitchMode ? (
            <Button
              type="button"
              variant="link"
              className={styles.linkButtonCls}
              onClick={onSwitchMode}
            >
              Sign in
            </Button>
          ) : (
            <Button asChild variant="link" className={styles.linkButtonCls}>
              <Link
                href={
                  safeRedirectParam
                    ? `/auth/signin?redirect=${encodeURIComponent(safeRedirectParam)}`
                    : "/auth/signin"
                }
              >
                Sign in
              </Link>
            </Button>
          )}
        </p>
      }
    >
      <SocialAuthButtons
        isLoading={isLoading}
        onGoogle={onGoogle}
        onGithub={onGithub}
        variant={styles.socialButtonVariant}
        className={styles.socialGapCls}
      />

      <div className={styles.dividerCls}>
        <hr className={styles.dividerHrCls} />
        <span className={styles.dividerTextCls}>Or use email</span>
        <hr className={styles.dividerHrCls} />
      </div>

      <div className={styles.fieldSpacingCls}>
        <Label htmlFor="email" className={styles.labelCls}>
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

      <div className={styles.fieldSpacingCls}>
        <Label htmlFor="password" className={styles.labelCls}>
          Password
        </Label>
        <Input
          type="password"
          required
          id="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className="placeholder:text-accent/50"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          pattern={strongPasswordPattern}
          title="8+ chars, uppercase, lowercase, number and symbol"
          aria-invalid={submitted && Boolean(getPasswordError(password))}
          aria-describedby={
            submitted && getPasswordError(password) ? "password-error" : undefined
          }
        />
        {submitted && getPasswordError(password) && (
          <p id="password-error" className={styles.errorTextCls}>
            {getPasswordError(password)}
          </p>
        )}
      </div>

      <LoadingButton
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        type="submit"
        loading={isLoading}
      >
        Sign Up
      </LoadingButton>
      {error && <p className={`${styles.errorTextCls} mt-2`}>{error}</p>}
    </AuthLayout>
  );
}
