"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@featul/auth/client";
import { Button } from "@featul/ui/components/button";
import { Checkbox } from "@featul/ui/components/checkbox";
import { Input } from "@featul/ui/components/input";
import { Label } from "@featul/ui/components/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@featul/ui/components/opt";
import { toast } from "sonner";
import { LoadingButton } from "@/components/global/LoadingButton";
import { AuthLayout, getAuthLayoutStyles } from "@/components/auth/AuthLayout";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { resolvePostAuthPath } from "@/lib/post/redirect";

type VerificationMethod = "totp" | "backup";

export default function TwoFactorChallenge() {
  const router = useRouter();
  const { safeRedirectParam, redirect } = useAuthRedirect();
  const styles = getAuthLayoutStyles(false);
  const [method, setMethod] = useState<VerificationMethod>("totp");
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const signInHref = safeRedirectParam
    ? `/auth/signin?redirect=${encodeURIComponent(safeRedirectParam)}`
    : "/auth/signin";

  const activeCode = method === "totp" ? totpCode.trim() : backupCode.trim();

  const resetErrorState = () => {
    setSubmitted(false);
    setError("");
  };

  const handleSuccess = async () => {
    toast.success("Two-factor verification complete");
    router.push(await resolvePostAuthPath(safeRedirectParam));
  };

  const handleSubmit = async () => {
    resetErrorState();
    setSubmitted(true);

    if (!activeCode) {
      setError(
        method === "totp"
          ? "Please enter the 6-digit code from your authenticator app."
          : "Please enter one of your backup codes.",
      );
      return;
    }

    if (method === "totp" && activeCode.length !== 6) {
      setError("Please enter the 6-digit code from your authenticator app.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result =
        method === "totp"
          ? await authClient.twoFactor.verifyTotp({
              code: activeCode,
              trustDevice,
            })
          : await authClient.twoFactor.verifyBackupCode({
              code: activeCode,
              trustDevice,
            });

      if (result?.error) {
        const message =
          result.error.message ||
          (method === "totp" ? "Invalid authentication code" : "Invalid backup code");
        setError(message);
        toast.error(message);
        return;
      }

      handleSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : method === "totp"
            ? "Unable to verify authentication code"
            : "Unable to verify backup code";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Two-factor authentication"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      footer={
        <p className={styles.footerTextCls}>
          Need to start over?
          <Button asChild variant="link" className={styles.linkButtonCls}>
            <Link href={signInHref}>Back to sign in</Link>
          </Button>
        </p>
      }
    >
      <div className="space-y-3">
        <p className={`${styles.mutedTextCls} text-center text-sm`}>
          Enter the code from your authenticator app, or use a backup code if you
          do not have your device.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={method === "totp" ? "default" : "card"}
            onClick={() => {
              setMethod("totp");
              resetErrorState();
            }}
          >
            Authenticator
          </Button>
          <Button
            type="button"
            variant={method === "backup" ? "default" : "card"}
            onClick={() => {
              setMethod("backup");
              resetErrorState();
            }}
          >
            Backup code
          </Button>
        </div>
      </div>

      {method === "totp" ? (
        <div className={styles.fieldSpacingCls}>
          <InputOTP
            maxLength={6}
            value={totpCode}
            onChange={(value) => {
              setTotpCode(value);
              resetErrorState();
            }}
            containerClassName="justify-center gap-2"
            aria-label="Two-factor authentication code"
            aria-invalid={submitted && Boolean(error)}
            aria-describedby={submitted && error ? "two-factor-error" : undefined}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} className="h-10 w-9 text-base" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <p className={styles.helperTextCls}>
            Enter the current 6-digit code from your authenticator app.
          </p>
        </div>
      ) : (
        <div className={styles.fieldSpacingCls}>
          <Label htmlFor="backup-code" className={styles.labelCls}>
            Backup code
          </Label>
          <Input
            id="backup-code"
            autoComplete="one-time-code"
            placeholder="ABCDE-12345"
            value={backupCode}
            onChange={(event) => {
              setBackupCode(event.target.value);
              resetErrorState();
            }}
          />
          <p className={styles.helperTextCls}>
            Backup codes are single-use. Enter one exactly as it was saved.
          </p>
        </div>
      )}

      <div className={`flex items-center justify-center gap-2 ${styles.mutedTextCls}`}>
        <Checkbox
          id="trust-device"
          checked={trustDevice}
          onCheckedChange={(value) => setTrustDevice(value === true)}
        />
        <Label htmlFor="trust-device" className={`text-xs font-normal ${styles.mutedTextCls}`}>
          Remember this device for 30 days
        </Label>
      </div>

      {submitted && error ? (
        <p id="two-factor-error" className={styles.errorTextCls}>
          {error}
        </p>
      ) : null}

      <LoadingButton
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        type="submit"
        loading={isSubmitting}
      >
        Verify and continue
      </LoadingButton>
    </AuthLayout>
  );
}
