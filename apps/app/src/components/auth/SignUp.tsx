"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@featul/auth/client";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Label } from "@featul/ui/components/label";
import { GoogleIcon } from "@featul/ui/icons/google";
import GitHubIcon from "@featul/ui/icons/github";
import Link from "next/link";
import { toast } from "sonner";
import {
  strongPasswordPattern,
  getPasswordError,
} from "@featul/auth/password";
import { LoadingButton } from "@/components/global/loading-button";
import { normalizeRedirectParam, resolveAuthRedirect } from "@/utils/auth-redirect";

export default function SignUp({ redirectTo }: { redirectTo?: string } = {}) {
  const router = useRouter();
  const search = useSearchParams();
  const rawRedirect = redirectTo || search?.get("redirect") || "";
  const safeRedirectParam = normalizeRedirectParam(rawRedirect);
  const redirect = resolveAuthRedirect(rawRedirect);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
    <section className="flex flex-1 bg-background px-4 sm:px-6 py-8 sm:py-12 items-center justify-center">
      <form
        noValidate
        className="bg-background m-auto h-fit w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="p-6 sm:p-8 pb-5 sm:pb-6">
          <div className="text-center">
            <h1 className="mb-2 mt-4 text-xl sm:text-2xl font-semibold text-center">
              Sign up to featul
            </h1>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="nav"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full text-sm font-normal gap-2 sm:gap-3 border-border/40 hover:bg-accent/40"
              >
                <div className="flex items-center gap-2">
                  <GoogleIcon className="size-4 sm:size-5" />
                  <span>Continue with Google</span>
                </div>
              </Button>
              <Button
                type="button"
                variant="nav"
                onClick={handleGithubSignUp}
                disabled={isLoading}
                className="w-full text-sm font-normal gap-2 sm:gap-3 border-border/40 hover:bg-accent/40"
              >
                <div className="flex items-center gap-2">
                  <GitHubIcon className="size-4 sm:size-5" />
                  <span>Continue with GitHub</span>
                </div>
              </Button>
            </div>

            <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <hr className="border-dashed" />
              <span className="text-muted-foreground text-xs">
                Or use email
              </span>
              <hr className="border-dashed" />
            </div>

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
                  submitted && getPasswordError(password)
                    ? "password-error"
                    : undefined
                }
              />
              {submitted && getPasswordError(password) && (
                <p id="password-error" className="text-destructive text-xs">
                  {getPasswordError(password)}
                </p>
              )}
            </div>

            <LoadingButton className="w-full bg-blue-500 hover:bg-blue-600 text-white" type="submit" loading={isLoading}>
              Sign Up
            </LoadingButton>
            {error && <p className="text-destructive text-xs mt-2 text-center">{error}</p>}

          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm font-normal">
            Already have an account?
            <Button asChild variant="link" className="px-2 text-primary">
              <Link href={safeRedirectParam ? `/auth/sign-in?redirect=${encodeURIComponent(safeRedirectParam)}` : "/auth/sign-in"}>Sign in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
