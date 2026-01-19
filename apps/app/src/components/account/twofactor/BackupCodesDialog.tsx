"use client"

import React from "react"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import { Button } from "@featul/ui/components/button"
import { ShieldIcon } from "@featul/ui/icons/shield"
import { toast } from "sonner"

type BackupCodesDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    backupCodes: string[]
}

export function BackupCodesDialog({
    open,
    onOpenChange,
    backupCodes,
}: BackupCodesDialogProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(backupCodes.join("\n"))
        toast.success("Backup codes copied to clipboard")
    }

    return (
        <SettingsDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Backup Codes"
            description="Save these codes in a secure place. Each code can only be used once."
            icon={<ShieldIcon className="size-4 text-primary" opacity={1} />}
        >
            <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                        <div
                            key={index}
                            className="bg-muted p-2 rounded text-center font-mono text-sm"
                        >
                            {code}
                        </div>
                    ))}
                </div>
                <Button
                    variant="outline"
                    onClick={handleCopy}
                    className="w-full"
                >
                    Copy All Codes
                </Button>
            </div>
        </SettingsDialogShell>
    )
}
