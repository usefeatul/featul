"use client"

import React from "react"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { cn } from "@featul/ui/lib/utils"

export default function CommentCollapseToggle({
  isCollapsed,
  replyCount,
  onToggle,
  className,
}: {
  isCollapsed: boolean
  replyCount: number
  onToggle: () => void
  className?: string
}) {
  const label = isCollapsed
    ? `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
    : "Hide replies"

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn("cursor-pointer", className)}
      aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
    >
      <OverlayChip innerClassName="gap-1 bg-primary/10 px-1.5 font-medium text-primary dark:bg-primary/10">
        <ChevronLeftIcon
          size={10}
          className={cn(
            "text-primary transition-transform duration-200",
            isCollapsed ? "rotate-180" : "-rotate-90",
          )}
        />
        {label}
      </OverlayChip>
    </button>
  )
}
