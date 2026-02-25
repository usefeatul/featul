"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@featul/auth/client";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Label } from "@featul/ui/components/label";
import Link from "next/link";
import { toast } from "sonner";
import { LoadingButton } from "@/components/global/loading-button";
import { AuthLayout, getAuthLayoutStyles } from "@/components/auth/AuthLayout";
import { LastUsedTag } from "@/components/auth/LastUsedTag";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function SignIn({
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
  const [lastUsedMethod, setLastUsedMethod] = useState<string | null>(null);
  const { safeRedirectParam, redirect } = useAuthRedirect(redirectTo);
  const styles = getAuthLayoutStyles(embedded);

  useEffect(() => {
    setLastUsedMethod(authClient.getLastUsedLoginMethod());
  }, []);

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

  return (
    <AuthLayout
      embedded={embedded}
      title="Sign in to featul"
      onSubmit={(e) => {
        e.preventDefault();
        handleEmailSignIn();
      }}
      footer={
        <>
          <p className="text-accent-foreground text-center text-sm font-normal mb-4">
            Don't have an account ?
            {embedded && onSwitchMode ? (
              <Button
                type="button"
                variant="link"
                className="px-2"
                onClick={onSwitchMode}
              >
                Create account
              </Button>
            ) : (
              <Button asChild variant="link" className="px-2">
                <Link
                  href={
                    safeRedirectParam
                      ? `/auth/sign-up?redirect=${encodeURIComponent(safeRedirectParam)}`
                      : "/auth/sign-up"
                  }
                >
                  Create account
                </Link>
              </Button>
            )}
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
        </>
      }
    >
      <SocialAuthButtons
        isLoading={isLoading}
        onGoogle={handleGoogleSignIn}
        onGithub={handleGithubSignIn}
        lastUsedMethod={lastUsedMethod}
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
          name="email"
          id="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="placeholder:text-accent/50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.pwdSpacingCls}>
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

      <LoadingButton
        className="relative overflow-visible w-full bg-primary text-primary-foreground hover:bg-primary/90"
        type="submit"
        loading={isLoading}
      >
        Sign In
        {lastUsedMethod === "email" ? (
          <LastUsedTag tone="onPrimary" />
        ) : null}
      </LoadingButton>
      {error && <p className="text-destructive text-xs mt-2 text-center">{error}</p>}
    </AuthLayout>
  );
}
