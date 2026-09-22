"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { LoadingButton } from "@/components/global/LoadingButton";
import {
    strongPasswordPattern,
    getPasswordError,
} from "@featul/auth/password";
import { resetPassword as resetPasswordOtp } from "../../utils/otp";
import { normalizeInternalRedirectPath } from "@/utils/path";
import { useOtpVerification } from "@/hooks/useOtpVerification";
import { AuthLayout, getAuthLayoutStyles } from "@/components/auth/AuthLayout";

export default function SetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rawRedirect = searchParams.get("redirect") || "";
    const redirectUrl = normalizeInternalRedirectPath(rawRedirect) || "/start";
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSetting, setIsSetting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [step, setStep] = useState<"send" | "otp" | "password">("send");
    const styles = getAuthLayoutStyles(false);
    const { sendCode, verifyCode: verifyOtp } = useOtpVerification({
        email,
        code,
        sendNextStep: "otp",
        verifyNextStep: "password",
        sendErrorMessage: "Failed to send code",
        sendSuccessMessage: "Verification code sent to your email",
        verifyErrorMessage: "Invalid or expired code",
        setError,
        setSubmitted,
        setStep,
        setIsSending,
        setIsVerifying,
    });

    // Get current user's email on mount
    useEffect(() => {
        const loadSession = async () => {
            try {
                const session = await authClient.getSession();
                if (session?.data?.user?.email) {
                    setEmail(session.data.user.email);
                } else {
                    // Not logged in, redirect to sign in
                    toast.error("Please sign in first");
                    router.push("/auth/signin?redirect=/auth/setpassword");
                }
            } catch {
                toast.error("Please sign in first");
                router.push("/auth/signin?redirect=/auth/setpassword");
            }
        };
        loadSession();
    }, [router]);

    const handleSetPassword = async () => {
        setIsSetting(true);
        setError("");
        setSubmitted(true);

        // Validate password match
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            toast.error("Passwords do not match");
            setIsSetting(false);
            return;
        }

        // Validate password strength
        const pwdErr = getPasswordError(password);
        if (pwdErr) {
            setError(pwdErr);
            toast.error(pwdErr);
            setIsSetting(false);
            return;
        }

        try {
            const { error } = await resetPasswordOtp(email, code, password);
            if (error) {
                if (error.message?.toLowerCase().includes("invalid") || error.message?.toLowerCase().includes("expired")) {
                    setStep("otp");
                    setCode("");
                }
                setError(error.message || "Failed to set password");
                toast.error(error.message || "Failed to set password");
                return;
            }

            toast.success("Password set successfully! You can now enable 2FA.");
            // Redirect back to security settings (or /start if no redirect param)
            router.push(redirectUrl);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to set password";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsSetting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === "send") {
            sendCode();
        } else if (step === "otp") {
            verifyOtp();
        } else if (step === "password") {
            handleSetPassword();
        }
    };
    return (
        <AuthLayout
            title="Set a password."
            description="Add a password to your account so you can enable extra security."
            onSubmit={handleSubmit}
            footer={
                <p className={styles.footerTextCls}>
                    Changed your mind?
                    <Button asChild variant="link" className={styles.linkButtonCls}>
                        <Link href={redirectUrl}>Go back</Link>
                    </Button>
                </p>
            }
        >
            {step === "send" && (
                <>
                    <div className={styles.fieldSpacingCls}>
                        <Label htmlFor="email" className={styles.labelCls}>
                            Email
                        </Label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            disabled
                            className="bg-muted"
                        />
                        <p className={styles.mutedTextCls}>
                            This is the email associated with your account
                        </p>
                    </div>
                    <LoadingButton
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        type="submit"
                        loading={isSending}
                    >
                        Send Verification Code
                    </LoadingButton>
                </>
            )}

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
                            aria-describedby={
                                submitted && error ? "code-error" : undefined
                            }
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
                        <p className={styles.helperTextCls}>
                            Enter the 6-digit code from your email
                        </p>
                    </div>

                    {submitted && error && (
                        <p id="code-error" className={styles.errorTextCls}>
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
                        onClick={sendCode}
                        loading={isSending}
                    >
                        Resend Code
                    </LoadingButton>
                </div>
            )}

            {step === "password" && (
                <div className="space-y-4">
                    <div className={styles.fieldSpacingCls}>
                        <Label htmlFor="password" className={styles.labelCls}>
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

                    <div className={styles.fieldSpacingCls}>
                        <Label htmlFor="confirmPassword" className={styles.labelCls}>
                            Confirm Password
                        </Label>
                        <Input
                            type="password"
                            required
                            id="confirmPassword"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className="placeholder:text-accent/50"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setSubmitted(false);
                                setError("");
                            }}
                        />
                    </div>

                    {submitted && error && (
                        <p id="password-error" className={styles.errorTextCls}>
                            {error}
                        </p>
                    )}

                    <LoadingButton
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        type="submit"
                        loading={isSetting}
                    >
                        Set Password
                    </LoadingButton>
                </div>
            )}
        </AuthLayout>
    );
}
