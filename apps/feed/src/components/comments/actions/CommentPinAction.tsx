"use client"

import React, { useTransition } from "react"
import { PopoverListItem } from "@oreilla/ui/components/popover"
import { PinIcon } from "@oreilla/ui/icons/pin"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"

interface CommentPinActionProps {
  commentId: string
  isPinned: boolean
  onSuccess?: () => void
  onCloseMenu?: () => void
}

export default function CommentPinAction({ commentId, isPinned, onSuccess, onCloseMenu }: CommentPinActionProps) {
  const [isPending, startTransition] = useTransition()

  const handleTogglePin = () => {
    if (isPending) return

    onCloseMenu?.()

    startTransition(async () => {
      try {
        const res = await client.comment.pin.$post({ commentId, isPinned: !isPinned })
        if (res.ok) {
          toast.success(!isPinned ? "Comment pinned" : "Comment unpinned")
          onSuccess?.()
        } else if (res.status === 401) {
          toast.error("Please sign in")
        } else if (res.status === 403) {
          toast.error("Only workspace owner can pin comments")
        } else {
          toast.error("Failed to update pin state")
        }
      } catch (error) {
        console.error("Failed to toggle pin:", error)
        toast.error("Failed to update pin state")
      }
    })
  }

  return (
    <PopoverListItem onClick={handleTogglePin} disabled={isPending}>
      <PinIcon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-sm">{isPinned ? "Unpin" : "Pin"}</span>
    </PopoverListItem>
  )
}

