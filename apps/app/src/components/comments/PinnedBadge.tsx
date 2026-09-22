"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import { commentBadgeClass } from "./styles"
import { Tooltip, TooltipTrigger, TooltipContent } from "@featul/ui/components/tooltip"
import { PinIcon } from "@featul/ui/icons/pin"

export default function PinnedBadge({ className, size = 10 }: { className?: string; size?: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(commentBadgeClass, className)}
          aria-label="Pinned"
        >
          <PinIcon width={size} height={size} className="text-accent" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="w-auto whitespace-nowrap px-2 py-1">
        Pinned
      </TooltipContent>
    </Tooltip>
  )
}
