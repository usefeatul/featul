"use client"

import React, { useTransition } from "react"
import { PopoverListItem } from "@featul/ui/components/popover"
import { LockIcon } from "@featul/ui/icons/lock"
import { client } from "@featul/api/client"
import { toast } from "sonner"

interface CommentVisibilityActionProps {
  commentId: string
  isInternal: boolean
  onSuccess?: () => void
  onCloseMenu?: () => void
}

export default function CommentVisibilityAction({
  commentId,
  isInternal,
  onSuccess,
  onCloseMenu,
}: CommentVisibilityActionProps) {
  const [isPending, startTransition] = useTransition()
  const nextIsInternal = !isInternal

  const handleToggleVisibility = () => {
    if (isPending) return

    onCloseMenu?.()

    startTransition(async () => {
      try {
        const res = await client.comment.setVisibility.$post({
          commentId,
          isInternal: nextIsInternal,
        })

        if (res.ok) {
          toast.success(nextIsInternal ? "Comment set to internal" : "Comment set to external")
          onSuccess?.()
          return
        }

        if (res.status === 401) {
          toast.error("Please sign in")
        } else if (res.status === 403) {
          toast.error("You don't have permission to change comment visibility")
        } else {
          const data = (await res.json().catch(() => null)) as { message?: string } | null
          toast.error(data?.message || "Failed to update comment visibility")
        }
      } catch (error) {
        console.error("Failed to update comment visibility:", error)
        toast.error("Failed to update comment visibility")
      }
    })
  }

  return (
    <PopoverListItem onClick={handleToggleVisibility} disabled={isPending}>
      <LockIcon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-sm">{nextIsInternal ? "Internal" : "External"}</span>
    </PopoverListItem>
  )
}
