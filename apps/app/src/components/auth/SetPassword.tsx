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
import { LoadingButton } from "@/components/global/loading-button";
import {
    strongPasswordPattern,
    getPasswordError,
} from "@featul/auth/password";
import {
    sendVerificationOtp,
    checkVerificationOtp,
    resetPassword as resetPasswordOtp,
} from "../../utils/otp-utils";

export default function SetPassword() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Validate redirect URL is internal only (security: prevent open redirects)
    const rawRedirect = searchParams.get("redirect") || "/start";
    const redirectUrl = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
        ? rawRedirect
        : "/start";
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
                    router.push("/auth/sign-in?redirect=/auth/set-password");
                }
            } catch {
                toast.error("Please sign in first");
                router.push("/auth/sign-in?redirect=/auth/set-password");
            }
        };
        loadSession();
    }, [router]);

    const sendCode = async () => {
        setIsSending(true);
        setError("");
        try {
            const { error } = await sendVerificationOtp(email, "forget-password");
            if (error) {
                setError(error.message || "Failed to send code");
                toast.error(error.message || "Failed to send code");
                return;
            }
            setStep("otp");
            toast.success("Verification code sent to your email");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to send code";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsSending(false);
        }
    };

    const verifyOtp = async () => {
        setIsVerifying(true);
        setError("");
        setSubmitted(true);

        if (code.trim().length !== 6) {
            setError("Please enter the 6-digit code.");
            setIsVerifying(false);
            return;
        }

        try {
            const { error } = await checkVerificationOtp({
                email: email.trim(),
                otp: code.trim(),
                type: "forget-password",
            });

            if (error) {
                setError(error.message || "Invalid or expired code");
                toast.error(error.message || "Invalid or expired code");
                return;
            }

            // OTP is valid, proceed to password step
            setStep("password");
            setSubmitted(false);
            setError("");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Invalid or expired code";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsVerifying(false);
        }
    };

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
        <section className="flex flex-1 bg-background px-4 sm:px-6 py-8 sm:py-12 items-center justify-center">
            <form
                noValidate
                className="bg-background m-auto h-fit w-full max-w-sm"
                onSubmit={handleSubmit}
            >
                <div className="p-6 sm:p-8 pb-5 sm:pb-6">
                    <div className="text-center">
                        <h1 className="mb-2 mt-4 text-xl sm:text-2xl font-semibold text-center">
                            Set a Password
                        </h1>
                    </div>

                    <div className="mt-6 space-y-6">
                        {/* Step 1: Send Code */}
                        {step === "send" && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="block text-sm">
                                        Email
                                    </Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        value={email}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This is the email associated with your account
                                    </p>
                                </div>
                                <LoadingButton
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                    type="submit"
                                    loading={isSending}
                                >
                                    Send Verification Code
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
                                    onClick={sendCode}
                                    loading={isSending}
                                >
                                    Resend Code
                                </LoadingButton>
                            </div>
                        )}

                        {/* Step 3: Set Password */}
                        {step === "password" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
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

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="block text-sm">
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
                                    <p id="password-error" className="text-destructive text-center text-xs">
                                        {error}
                                    </p>
                                )}

                                <LoadingButton className="w-full" type="submit" loading={isSetting}>
                                    Set Password
                                </LoadingButton>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm font-normal">
                        Changed your mind?
                        <Button asChild variant="link" className="px-2 text-primary">
                            <Link href={redirectUrl}>Go back</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    );
}
