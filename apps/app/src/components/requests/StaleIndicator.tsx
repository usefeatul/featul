"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@featul/ui/components/tooltip"

interface StaleMarkProps {
  days: number
  className?: string
}

/** Compact age badge with the exact stale duration available on hover or focus. */
export function StaleMark({ days, className }: StaleMarkProps) {
  const label = `Stale for ${days} day${days === 1 ? "" : "s"}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative z-10 h-5 shrink-0 items-center rounded bg-amber-400 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950",
            className,
          )}
        >
          Stale {days >= 30 ? `${Math.floor(days / 30)}mo` : `${days}d`}
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={6}
        className="w-auto whitespace-nowrap px-2 py-1 text-xs"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
