"use client"

import React from "react"
import { AlertDialogShell } from "@/components/global/AlertDialogShell"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@featul/ui/components/alert-dialog"

interface ChangelogBulkDeleteDialogProps {
    open: boolean
    selectedCount: number
    isPending: boolean
    onOpenChange: (open: boolean) => void
    onConfirmDelete: () => void
}

export function ChangelogBulkDeleteDialog({ open, selectedCount, isPending, onOpenChange, onConfirmDelete }: ChangelogBulkDeleteDialogProps) {
    return (
        <AlertDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Delete selected entries?"
            description={`This will permanently delete ${selectedCount} ${selectedCount === 1 ? "entry" : "entries"}.`}
        >
            <AlertDialogFooter className="flex justify-end gap-2 mt-2">
                <AlertDialogCancel disabled={isPending} className="h-8 px-3 text-sm">
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                    onClick={(event) => {
                        event.preventDefault()
                        onConfirmDelete()
                    }}
                    disabled={isPending}
                    className="h-8 px-4 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                    {isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogShell>
    )
}
