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
import { LoadingButton } from "@/components/global/loading-button";
import { AuthLayout, getAuthLayoutStyles } from "@/components/auth/AuthLayout";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

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

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirect,
      });
    } catch {
      setError("Failed with Google");
      toast.error("Failed with Google");
      setIsLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: redirect,
      });
    } catch {
      setError("Failed with GitHub");
      toast.error("Failed with GitHub");
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
        <p className="text-accent-foreground text-center text-sm font-normal">
          Already have an account?
          {embedded && onSwitchMode ? (
            <Button
              type="button"
              variant="link"
              className="px-2 text-primary"
              onClick={onSwitchMode}
            >
              Sign in
            </Button>
          ) : (
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
          )}
        </p>
      }
    >
      <SocialAuthButtons
        isLoading={isLoading}
        onGoogle={handleGoogleSignUp}
        onGithub={handleGithubSignUp}
        className={styles.socialGapCls}
      />

      <div className={styles.dividerCls}>
        <hr className="border-dashed" />
        <span className="text-muted-foreground text-xs">Or use email</span>
        <hr className="border-dashed" />
      </div>

      <div className={styles.fieldSpacingCls}>
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

      <div className={styles.fieldSpacingCls}>
        <Label htmlFor="password" className="block text-sm">
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
          <p id="password-error" className="text-destructive text-xs">
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
      {error && <p className="text-destructive text-xs mt-2 text-center">{error}</p>}
    </AuthLayout>
  );
}
