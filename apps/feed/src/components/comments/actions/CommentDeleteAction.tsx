"use client"

import React, { useState, useTransition } from "react"
import { TrashIcon } from "@oreilla/ui/icons/trash"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"
import { PopoverListItem } from "@oreilla/ui/components/popover"

interface CommentDeleteActionProps {
  commentId: string
  postId: string
  onSuccess?: () => void
  onCloseMenu?: () => void
}

export default function CommentDeleteAction({ commentId, postId, onSuccess, onCloseMenu }: CommentDeleteActionProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (isDeleting || isPending) return
    
    setIsDeleting(true)
    onCloseMenu?.()
    
    startTransition(async () => {
      try {
        const res = await client.comment.delete.$post({ commentId })
        if (res.ok) {
          toast.success("Comment deleted")
          try {
            window.dispatchEvent(
              new CustomEvent("comment:deleted", { detail: { postId } })
            )
          } catch {}
          onSuccess?.()
        } else {
          toast.error("Failed to delete comment")
          setIsDeleting(false)
        }
      } catch (error) {
        console.error("Failed to delete comment:", error)
        toast.error("Failed to delete comment")
        setIsDeleting(false)
      }
    })
  }

  return (
    <PopoverListItem
      onClick={handleDelete}
      className="text-destructive"
      disabled={isDeleting || isPending}
    >
      <TrashIcon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-sm">{isDeleting ? "Deleting..." : "Delete"}</span>
    </PopoverListItem>
  )
}
