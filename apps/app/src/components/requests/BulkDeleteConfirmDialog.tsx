"use client"

import React from "react"
import { AlertDialogShell } from "@/components/global/AlertDialogShell"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@featul/ui/components/alert-dialog"

interface BulkDeleteConfirmDialogProps {
  open: boolean
  selectedCount: number
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: () => void
}

export function BulkDeleteConfirmDialog({ open, selectedCount, isPending, onOpenChange, onConfirmDelete }: BulkDeleteConfirmDialogProps) {
  return (
    <AlertDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Delete selected posts?"
      description={`This will permanently delete ${selectedCount} ${selectedCount === 1 ? "post" : "posts"}.`}
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
          className="h-8 px-4 text-sm bg-red-500 hover:bg-red-600 text-white"
        >
          {isPending ? "Deleting..." : "Delete"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogShell>
  )
}
