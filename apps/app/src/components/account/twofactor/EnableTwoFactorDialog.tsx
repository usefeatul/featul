"use client"

import React from "react"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import { Button } from "@featul/ui/components/button"
import { Input } from "@featul/ui/components/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@featul/ui/components/opt"
import { ShieldIcon } from "@featul/ui/icons/shield"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"

type EnableTwoFactorDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    loading: boolean
    enableStep: "password" | "qr" | "verify"
    password: string
    setPassword: (value: string) => void
    totpUri: string
    verifyCode: string
    setVerifyCode: (value: string) => void
    setEnableStep: (step: "password" | "qr" | "verify") => void
    onEnableStart: () => void
    onVerifyTotp: () => void
}

export function EnableTwoFactorDialog({
    open,
    onOpenChange,
    loading,
    enableStep,
    password,
    setPassword,
    totpUri,
    verifyCode,
    setVerifyCode,
    setEnableStep,
    onEnableStart,
    onVerifyTotp,
}: EnableTwoFactorDialogProps) {
    const description =
        enableStep === "password" ? "Enter your password to begin setup." :
            enableStep === "qr" ? undefined :
                "Enter the code from your authenticator app."

    const handleCopyUri = () => {
        navigator.clipboard.writeText(totpUri)
        toast.success("URI copied to clipboard")
    }

    return (
        <SettingsDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Enable Two-Factor Authentication"
            description={description}
            icon={<ShieldIcon className="size-4 text-primary" opacity={1} />}
        >
            <div className="space-y-4 py-2">
                {enableStep === "password" && (
                    <>
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onEnableStart()}
                            className="placeholder:text-accent"
                        />
                        <Button onClick={onEnableStart} disabled={loading} className="w-full">
                            Continue
                        </Button>
                    </>
                )}

                {enableStep === "qr" && (
                    <>
                        <div className="flex flex-col items-center gap-4">
                            {totpUri && (
                                <div className="bg-white p-4 rounded-lg">
                                    <QRCodeSVG
                                        value={totpUri}
                                        size={180}
                                        level="M"
                                        includeMargin={false}
                                    />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground text-center">
                                Scan with Google Authenticator, Authy, or similar app
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyUri}
                                className="text-xs"
                            >
                                Can&apos;t scan? Copy setup key
                            </Button>
                        </div>
                        <Button onClick={() => setEnableStep("verify")} className="w-full">
                            I&apos;ve Added It
                        </Button>
                    </>
                )}

                {enableStep === "verify" && (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={verifyCode}
                                onChange={(value) => setVerifyCode(value)}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <Button onClick={onVerifyTotp} disabled={loading || verifyCode.length !== 6} className="w-full">
                            Verify & Enable
                        </Button>
                    </div>
                )}
            </div>
        </SettingsDialogShell>
    )
}
