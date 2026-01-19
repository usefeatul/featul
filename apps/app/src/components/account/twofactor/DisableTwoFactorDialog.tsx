"use client"

import React from "react"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import { Button } from "@featul/ui/components/button"
import { Input } from "@featul/ui/components/input"
import { ShieldIcon } from "@featul/ui/icons/shield"

type DisableTwoFactorDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    loading: boolean
    password: string
    setPassword: (value: string) => void
    onDisable: () => void
}

export function DisableTwoFactorDialog({
    open,
    onOpenChange,
    loading,
    password,
    setPassword,
    onDisable,
}: DisableTwoFactorDialogProps) {
    return (
        <SettingsDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Disable Two-Factor Authentication"
            description="Enter your password to disable 2FA. This will make your account less secure."
            icon={<ShieldIcon className="size-4 text-primary" opacity={1} />}
        >
            <div className="space-y-4 py-2">
                <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onDisable()}
                    className="placeholder:text-accent"
                />
                <Button variant="destructive" onClick={onDisable} disabled={loading} className="w-full">
                    Disable 2FA
                </Button>
            </div>
        </SettingsDialogShell>
    )
}
