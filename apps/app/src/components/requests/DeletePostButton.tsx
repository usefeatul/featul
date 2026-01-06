"use client"

import React, { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@featul/ui/components/button"
import { AlertDialogShell } from "@/components/global/AlertDialogShell"
import { TrashIcon } from "@featul/ui/icons/trash"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@featul/ui/components/alert-dialog"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { PostDeletedEventDetail } from "@/types/events"

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
            if (workspaceSlug) {
              const detail: PostDeletedEventDetail = { postId, workspaceSlug, status: null }
              window.dispatchEvent(new CustomEvent<PostDeletedEventDetail>("post:deleted", { detail }))
            }
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
      <AlertDialogShell
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Are you absolutely sure?"
        description="This will permanently delete this post."
      >
        <AlertDialogFooter className="flex justify-end gap-2 mt-2">
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
      </AlertDialogShell>
    </>
  )
}
