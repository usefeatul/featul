"use client"

import React from "react"
import { useChangelogEntryActions } from "./useChangelogEntryActions"
import { AlertDialogShell } from "@/components/global/AlertDialogShell"
import { Button } from "@featul/ui/components/button"

interface ChangelogDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    workspaceSlug: string
    entryId: string
    onSuccess?: () => void
}

export function ChangelogDeleteDialog({
    open,
    onOpenChange,
    workspaceSlug,
    entryId,
    onSuccess,
}: ChangelogDeleteDialogProps) {
    const { deleteEntry, isPending } = useChangelogEntryActions({
        workspaceSlug,
        entryId,
        onSuccess: () => {
            onSuccess?.()
            onOpenChange(false)
        }
    })

    const handleDelete = () => {
        deleteEntry()
    }

    return (
        <AlertDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Entry"
        >
            <div className="flex flex-col gap-4 p-2">
                <div className="text-sm text-muted-foreground">
                    Are you sure you want to delete this changelog entry? This action cannot be undone.
                </div>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        size="sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                        size="sm"
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </div>
        </AlertDialogShell>
    )
}
