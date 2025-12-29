"use client"

import React, { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@oreilla/ui/components/button"
import { TrashIcon } from "@oreilla/ui/icons/trash"
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
import { client } from "@oreilla/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { PostDeletedEventDetail } from "../../types/events"

export interface DeletePostButtonProps {
  postId: string
  workspaceSlug?: string
  backHref?: string
  className?: string
}

export function DeletePostButton({ postId, workspaceSlug, backHref, className }: DeletePostButtonProps) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await client.post.delete.$post({ postId })
        if (res.ok) {
          toast.success("Post deleted successfully")
          try {
            const detail: PostDeletedEventDetail = { postId, workspaceSlug }
            window.dispatchEvent(new CustomEvent<PostDeletedEventDetail>("post:deleted", { detail }))
          } catch {}

          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch {}

          const target = backHref || (workspaceSlug ? "/" : null)
          if (target) {
            router.push(target)
            router.refresh()
          } else {
            router.back()
            router.refresh()
          }
        } else {
          const err = await res.json().catch(() => null)
          toast.error(((err as any)?.message as string) || "Failed to delete post")
        }
      } catch (error) {
        toast.error("Failed to delete post")
      } finally {
        setConfirmOpen(false)
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="nav"
        size="icon-sm"
        className={`rounded-none border-none shadow-none hover:text-destructive dark:hover:text-destructive/50 hover:bg-destructive/5 focus-visible:ring-0 focus-visible:ring-offset-0 ${className || ""}`}
        aria-label="Delete"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
      >
        <TrashIcon className="size-3.5" />
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="p-1 bg-muted rounded-xl gap-2">
          <AlertDialogHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <AlertDialogTitle className="flex items-center gap-2 px-2 mt-1 py-1 text-sm font-normal">
              <TrashIcon width={18} height={18} className="opacity-80" />
              Are you absolutely sure?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="bg-card rounded-lg p-2 dark:bg-black/40 border border-border">
            <AlertDialogDescription className="space-y-3 text-sm text-accent mb-2">
              <span className="block">
                This will permanently delete this post.
              </span>
            </AlertDialogDescription>
            <AlertDialogFooter className="flex justify-end gap-2 mt-4">
              <AlertDialogCancel disabled={isPending} className="h-8 px-3 text-sm">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
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
    </>
  )
}
