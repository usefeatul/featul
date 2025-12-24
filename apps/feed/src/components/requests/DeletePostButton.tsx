"use client"

import React, { useState, useTransition } from "react"
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

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await client.post.delete.$post({ postId })
        if (res.ok) {
          toast.success("Post deleted successfully")
          try {
            window.dispatchEvent(new CustomEvent("post:deleted", { detail: { postId } }))
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-accent">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

