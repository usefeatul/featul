"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@oreilla/ui/components/alert-dialog"

interface BulkDeleteConfirmDialogProps {
  open: boolean
  selectedCount: number
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirmDelete: () => void
}

export function BulkDeleteConfirmDialog({ open, selectedCount, isPending, onOpenChange, onConfirmDelete }: BulkDeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-1 bg-muted rounded-xl gap-2">
        <AlertDialogHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <AlertDialogTitle className="flex items-center gap-2 px-2 mt-1 py-1 text-sm font-normal">
            Delete selected posts?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div className="bg-card rounded-lg p-2 dark:bg-black/40 border border-border">
          <AlertDialogDescription className="space-y-3 text-sm text-accent mb-2">
            <span className="block">
              This will permanently delete {selectedCount} {selectedCount === 1 ? "post" : "posts"}.
            </span>
          </AlertDialogDescription>
          <AlertDialogFooter className="flex justify-end gap-2 mt-4">
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
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
