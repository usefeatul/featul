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

export default function SignUp() {
  const router = useRouter();
  const search = useSearchParams();
  const rawRedirect = search?.get("redirect") || "";
  const redirect = rawRedirect.startsWith("/") ? rawRedirect : "/start";
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
        callbackURL: `/auth/verify?email=${encodeURIComponent(email.trim())}${rawRedirect ? `&redirect=${encodeURIComponent(rawRedirect)}` : ""}`,
      });
      toast.success("Account created. Check your email for the code");
      router.push(`/auth/verify?email=${encodeURIComponent(email)}${rawRedirect ? `&redirect=${encodeURIComponent(rawRedirect)}` : ""}`);
    } catch (e: any) {
      setError(e?.message || "Failed to sign up");
      toast.error(e?.message || "Failed to sign up");
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
    } catch (err) {
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
    } catch (err) {
      setError("Failed with GitHub");
      toast.error("Failed with GitHub");
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-12">
      <form
        noValidate
        className="bg-background m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border border-border shadow-sm shadow-zinc-950/3 dark:[--color-muted:var(--color-zinc-900)] ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="bg-card dark:bg-black/40 -m-px rounded-[calc(var(--radius)+.125rem)] border p-6 sm:p-8 pb-5 sm:pb-6">
          <div className="text-left">
            <h1 className="mb-2 mt-4 text-xl sm:text-2xl font-semibold text-left">
              Sign up to featul
            </h1>
            <p className="text-xs sm:text-sm text-accent mb-2 text-left">
              Sign up with social or email
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="text-sm sm:text-base gap-2 sm:gap-3"
              >
                <GoogleIcon className="size-4 sm:size-5" />
                <span>Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGithubSignUp}
                disabled={isLoading}
                className="text-sm sm:text-base gap-2 sm:gap-3"
              >
                <GitHubIcon className="size-4 sm:size-5" />
                <span>GitHub</span>
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

            <LoadingButton className="w-full" type="submit" loading={isLoading}>
              Sign Up
            </LoadingButton>

          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm sm:text-base">
            Already have an account?
            <Button asChild variant="link" className="px-2 text-primary">
              <Link href={rawRedirect ? `/auth/sign-in?redirect=${encodeURIComponent(rawRedirect)}` : "/auth/sign-in"}>Sign in</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}