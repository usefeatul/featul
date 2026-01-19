"use client"

import React from "react"
import { usePathname } from "next/navigation"
import SettingsCard from "@/components/global/SettingsCard"
import { authClient } from "@featul/auth/client"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ShieldIcon } from "@featul/ui/icons/shield"
import { EnableTwoFactorDialog, DisableTwoFactorDialog, BackupCodesDialog } from "./twofactor"

type TwoFactorAuthProps = {
    twoFactorEnabled?: boolean
    hasPassword?: boolean
}

export default function TwoFactorAuth({ twoFactorEnabled = false, hasPassword = true }: TwoFactorAuthProps) {
    const pathname = usePathname()
    const queryClient = useQueryClient()
    const [loading, setLoading] = React.useState(false)
    const [isEnabled, setIsEnabled] = React.useState(twoFactorEnabled)

    // Dialog states
    const [showEnableDialog, setShowEnableDialog] = React.useState(false)
    const [showDisableDialog, setShowDisableDialog] = React.useState(false)
    const [showBackupCodesDialog, setShowBackupCodesDialog] = React.useState(false)

    // Enable flow states
    const [enableStep, setEnableStep] = React.useState<"password" | "qr" | "verify">("password")
    const [password, setPassword] = React.useState("")
    const [totpUri, setTotpUri] = React.useState("")
    const [backupCodes, setBackupCodes] = React.useState<string[]>([])
    const [verifyCode, setVerifyCode] = React.useState("")

    const resetEnableFlow = React.useCallback(() => {
        setEnableStep("password")
        setPassword("")
        setTotpUri("")
        setVerifyCode("")
        setBackupCodes([])
    }, [])

    // Enable 2FA - Step 1: Verify password and get TOTP URI
    const onEnableStart = React.useCallback(async () => {
        if (!password.trim()) {
            toast.error("Please enter your password")
            return
        }
        setLoading(true)
        const toastId = toast.loading("Setting up 2FA...")
        try {
            const result = await authClient.twoFactor.enable({ password })
            if (result?.error) {
                toast.error(result.error.message || "Failed to enable 2FA", { id: toastId })
                return
            }
            if (result?.data?.totpURI) {
                setTotpUri(result.data.totpURI)
                if (result.data.backupCodes) {
                    setBackupCodes(result.data.backupCodes)
                }
                setEnableStep("qr")
                toast.dismiss(toastId)
            } else {
                toast.error("Failed to generate QR code", { id: toastId })
            }
        } catch {
            toast.error("Failed to enable 2FA", { id: toastId })
        } finally {
            setLoading(false)
        }
    }, [password])

    // Enable 2FA - Step 2: Verify TOTP code
    const onVerifyTotp = React.useCallback(async () => {
        if (!verifyCode.trim() || verifyCode.length !== 6) {
            toast.error("Please enter a 6-digit code")
            return
        }
        setLoading(true)
        const toastId = toast.loading("Verifying code...")
        try {
            const result = await authClient.twoFactor.verifyTotp({ code: verifyCode })
            if (result?.error) {
                toast.error(result.error.message || "Invalid code", { id: toastId })
                return
            }
            setIsEnabled(true)
            toast.success("Two-factor authentication enabled!", { id: toastId })
            setShowEnableDialog(false)

            // Show backup codes BEFORE resetting (so they're still in state)
            if (backupCodes.length > 0) {
                setShowBackupCodesDialog(true)
            }

            // Reset only non-backup-code fields
            setEnableStep("password")
            setPassword("")
            setTotpUri("")
            setVerifyCode("")

            queryClient.invalidateQueries({ queryKey: ["session"] })
        } catch {
            toast.error("Failed to verify code", { id: toastId })
        } finally {
            setLoading(false)
        }
    }, [verifyCode, backupCodes.length, queryClient])

    // Disable 2FA
    const onDisable = React.useCallback(async () => {
        if (!password.trim()) {
            toast.error("Please enter your password")
            return
        }
        setLoading(true)
        const toastId = toast.loading("Disabling 2FA...")
        try {
            const result = await authClient.twoFactor.disable({ password })
            if (result?.error) {
                toast.error(result.error.message || "Failed to disable 2FA", { id: toastId })
                return
            }
            setIsEnabled(false)
            toast.success("Two-factor authentication disabled", { id: toastId })
            setShowDisableDialog(false)
            setPassword("")
            queryClient.invalidateQueries({ queryKey: ["session"] })
        } catch {
            toast.error("Failed to disable 2FA", { id: toastId })
        } finally {
            setLoading(false)
        }
    }, [password, queryClient])

    const handleAction = React.useCallback(() => {
        if (isEnabled) {
            setShowDisableDialog(true)
        } else {
            setShowEnableDialog(true)
        }
    }, [isEnabled])

    const handleEnableDialogChange = React.useCallback((open: boolean) => {
        setShowEnableDialog(open)
        if (!open) resetEnableFlow()
    }, [resetEnableFlow])

    const handleDisableDialogChange = React.useCallback((open: boolean) => {
        setShowDisableDialog(open)
        if (!open) setPassword("")
    }, [])

    const handleBackupCodesDialogChange = React.useCallback((open: boolean) => {
        setShowBackupCodesDialog(open)
        if (!open) setBackupCodes([])
    }, [])

    // If no password, show message to set up password first
    if (!hasPassword && !isEnabled) {
        return (
            <SettingsCard
                title="Two-Factor Auth"
                description="To enable 2FA, first set a password for your account."
                icon={<ShieldIcon className="size-5 text-primary" opacity={1} />}
                isConnected={false}
                buttonLabel="Set Password"
                onAction={() => window.location.href = `/auth/set-password?redirect=${encodeURIComponent(pathname)}`}
            />
        )
    }

    return (
        <>
            <SettingsCard
                title="Two-Factor Auth"
                description="Add an extra layer of security with TOTP authentication."
                icon={<ShieldIcon className="size-5 text-primary" opacity={1} />}
                onAction={handleAction}
                buttonLabel={isEnabled ? "Disable" : "Enable"}
                buttonVariant="card"
                isConnected={isEnabled}
                isLoading={loading}
                disabled={loading}
            />

            <EnableTwoFactorDialog
                open={showEnableDialog}
                onOpenChange={handleEnableDialogChange}
                loading={loading}
                enableStep={enableStep}
                password={password}
                setPassword={setPassword}
                totpUri={totpUri}
                verifyCode={verifyCode}
                setVerifyCode={setVerifyCode}
                setEnableStep={setEnableStep}
                onEnableStart={onEnableStart}
                onVerifyTotp={onVerifyTotp}
            />

            <DisableTwoFactorDialog
                open={showDisableDialog}
                onOpenChange={handleDisableDialogChange}
                loading={loading}
                password={password}
                setPassword={setPassword}
                onDisable={onDisable}
            />

            <BackupCodesDialog
                open={showBackupCodesDialog}
                onOpenChange={handleBackupCodesDialogChange}
                backupCodes={backupCodes}
            />
        </>
    )
}
