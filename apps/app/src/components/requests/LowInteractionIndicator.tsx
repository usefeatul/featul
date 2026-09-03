"use client"

import React from "react"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
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
          className={className}
        >
          <OverlayChip innerClassName="h-6 min-h-6 whitespace-nowrap px-2 text-xs font-medium text-violet-600 dark:text-violet-400">
            Low Traction
          </OverlayChip>
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
