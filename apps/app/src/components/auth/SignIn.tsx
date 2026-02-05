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
import { LoadingButton } from "@/components/global/loading-button";
import { normalizeRedirectParam, resolveAuthRedirect } from "@/utils/auth-redirect";

export default function SignIn({
  redirectTo,
  embedded = false,
}: {
  redirectTo?: string;
  embedded?: boolean;
} = {}) {
  const router = useRouter();
  const search = useSearchParams();
  const rawRedirect = redirectTo || search?.get("redirect") || "";
  const safeRedirectParam = normalizeRedirectParam(rawRedirect);
  const redirect = resolveAuthRedirect(rawRedirect);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirect,
      });
    } catch {
      setError("Failed to sign in with Google");
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: redirect,
      });
    } catch {
      setError("Failed to sign in with GitHub");
      toast.error("Failed to sign in with GitHub");
      setIsLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await authClient.signIn.passkey();
      if (result?.error) {
        setError(result.error.message || "Failed to sign in with passkey");
        toast.error(result.error.message || "Failed to sign in with passkey");
      } else {
        toast.success("Signed in with passkey");
        router.push(redirect);
      }
    } catch {
      setError("Failed to sign in with passkey");
      toast.error("Failed to sign in with passkey");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await authClient.signIn.email(
        { email: email.trim(), password, callbackURL: redirect },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast.info("Please verify your email");
              router.push(`/auth/verify?email=${encodeURIComponent(email.trim())}`);
              return;
            }
            setError(ctx.error.message);
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Signed in");
            router.push(redirect);
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sectionCls = embedded
    ? "flex flex-1 px-4 sm:px-6 py-4 sm:py-6 items-center justify-center"
    : "flex flex-1 bg-background px-4 sm:px-6 py-8 sm:py-12 items-center justify-center";
  const formCls = embedded
    ? "m-auto h-fit w-full max-w-sm"
    : "bg-background m-auto h-fit w-full max-w-sm";

  return (
    <section className={sectionCls}>
      <form
        noValidate
        className={formCls}
        onSubmit={(e) => {
          e.preventDefault();
          handleEmailSignIn();
        }}
      >
        <div className="p-6 sm:p-8 pb-5 sm:pb-6">
          <div className="text-center">
            <h1 className="mb-2 mt-4 text-xl sm:text-2xl font-semibold text-center">
              Sign in to featul
            </h1>
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="nav"
                onClick={handleGoogleSignIn}
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
                onClick={handleGithubSignIn}
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
                name="email"
                id="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="placeholder:text-accent/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-sm">
                  Password
                </Label>
                <Button asChild variant="link" size="sm">
                  <Link href="/auth/forgot-password" className="text-sm">
                    Forgot your Password ?
                  </Link>
                </Button>
              </div>
              <Input
                type="password"
                required
                name="password"
                id="pwd"
                autoComplete="current-password"
                placeholder="••••••••"
                className="placeholder:text-accent/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <LoadingButton className="w-full bg-blue-500 hover:bg-blue-600 text-white" type="submit" loading={isLoading}>
              Sign In
            </LoadingButton>
            {error && <p className="text-destructive text-xs mt-2 text-center">{error}</p>}
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm font-normal mb-4">
            Don't have an account ?
            <Button asChild variant="link" className="px-2">
              <Link href={safeRedirectParam ? `/auth/sign-up?redirect=${encodeURIComponent(safeRedirectParam)}` : "/auth/sign-up"}>Create account</Link>
            </Button>
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handlePasskeySignIn}
              disabled={isLoading}
              className="text-sm font-medium text-foreground/80 hover:text-foreground flex items-center gap-2 transition-colors cursor-pointer"
            >
              Sign in with passkey
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
