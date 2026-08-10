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

/** Invisible hit target on the row's left border — the border itself is colored amber when stale. */
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
            "absolute inset-y-0 left-0 z-20 w-3 cursor-default",
            className,
          )}
        />
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
