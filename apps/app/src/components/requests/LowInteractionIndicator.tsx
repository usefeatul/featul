"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import { requestBadgeClass } from "./styles"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@featul/ui/components/tooltip"

interface LowInteractionMarkProps {
  days: number
  className?: string
}

/** Compact row attribute for posts with no extra likes or comments after 5 days. */
export function LowInteractionMark({ days, className }: LowInteractionMarkProps) {
  const label = `No likes or comments for ${days} day${days === 1 ? "" : "s"}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className={cn(requestBadgeClass, "whitespace-nowrap uppercase tracking-[0.06em]", className)}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
          Low Traction
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={4}
        className="w-auto whitespace-nowrap px-2 py-1 text-xs"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
