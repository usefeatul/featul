"use client"

import React from "react"
import { Clock } from "lucide-react"
import { cn } from "@featul/ui/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@featul/ui/components/tooltip"
import { isActivelySnoozed } from "@featul/api/shared/snooze"

interface SnoozeIndicatorProps {
  snoozedUntil?: string | null
  className?: string
}

function formatSnoozeUntil(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

/** Meta-row cue for actively snoozed posts (shown in the snoozed filter view). */
export function SnoozeIndicator({
  snoozedUntil,
  className,
}: SnoozeIndicatorProps) {
  if (!isActivelySnoozed(snoozedUntil) || !snoozedUntil) return null

  const untilLabel = formatSnoozeUntil(snoozedUntil)
  const label = `Snoozed until ${untilLabel}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "inline-flex items-center gap-1 text-sky-600 dark:text-sky-400",
            className,
          )}
          aria-label={label}
        >
          <Clock className="size-3.5" strokeWidth={2.25} aria-hidden />
          <span className="text-xs tabular-nums">{untilLabel}</span>
        </div>
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
