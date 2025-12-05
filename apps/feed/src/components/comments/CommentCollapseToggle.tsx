"use client"

import React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@feedgot/ui/lib/utils"

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
  return (
    <button
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors",
        className
      )}
      aria-label={isCollapsed ? "Expand replies" : "Collapse replies"}
    >
      {isCollapsed ? (
        <>
          <ChevronDown className="h-3 w-3" />
          <span className="font-medium">{replyCount} replies</span>
        </>
      ) : (
        <ChevronUp className="h-3 w-3" />
      )}
    </button>
  )
}

