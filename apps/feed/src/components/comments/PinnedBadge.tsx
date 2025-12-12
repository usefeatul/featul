"use client"

import React from "react"
import { cn } from "@oreilla/ui/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@oreilla/ui/components/tooltip"
import { PinIcon } from "@oreilla/ui/icons/pin"

export default function PinnedBadge({ className, size = 12 }: { className?: string; size?: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center rounded-full bg-background p-0.5", className)} aria-label="Pinned">
          <PinIcon width={size} height={size} className="text-primary" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="w-auto whitespace-nowrap px-2 py-1">Pinned</TooltipContent>
    </Tooltip>
  )
}
