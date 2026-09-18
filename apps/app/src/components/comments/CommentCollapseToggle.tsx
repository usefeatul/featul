"use client"

import React from "react"
import { commentBadgeClass } from "./styles"
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
      className={cn(commentBadgeClass, "cursor-pointer hover:bg-black/[0.08] focus-visible:outline-2 focus-visible:outline-ring dark:hover:bg-[#303030]", className)}
      aria-expanded={!isCollapsed}
      aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
    >
        <ChevronLeftIcon
          size={10}
          className={cn(
            "text-accent transition-transform duration-200",
            isCollapsed ? "rotate-180" : "-rotate-90",
          )}
        />
        {label}
    </button>
  )
}
