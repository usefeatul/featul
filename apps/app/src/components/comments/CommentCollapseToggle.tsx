"use client"

import React from "react"
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
      onClick={onToggle}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
        className
      )}
      aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
    >
      <ChevronLeftIcon
        size={12}
        className={cn(
          "transition-transform duration-200",
          isCollapsed ? "rotate-180" : "-rotate-90"
        )}
      />
      <span className="font-medium">{label}</span>
    </button>
  )
}
