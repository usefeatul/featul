"use client"

import React from "react"
import { AlertDialogShell } from "@/components/global/AlertDialogShell"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@featul/ui/components/alert-dialog"

interface RequestDeleteDialogProps {
    open: boolean
    isPending: boolean
    onOpenChange: (open: boolean) => void
    onConfirmDelete: () => void
}

export function RequestDeleteDialog({ open, isPending, onOpenChange, onConfirmDelete }: RequestDeleteDialogProps) {
    return (
        <AlertDialogShell
            open={open}
            onOpenChange={onOpenChange}
            title="Delete request?"
            description="This will permanently delete this request. This action cannot be undone."
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
