"use client"

import React from "react"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
import { Tooltip, TooltipTrigger, TooltipContent } from "@featul/ui/components/tooltip"
import { PinIcon } from "@featul/ui/icons/pin"

export default function PinnedBadge({ className, size = 10 }: { className?: string; size?: number }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <OverlayChip
          className={className}
          innerClassName="bg-primary/10 text-primary dark:bg-primary/10"
          aria-label="Pinned"
        >
          <PinIcon width={size} height={size} className="text-primary" />
        </OverlayChip>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={4} className="w-auto whitespace-nowrap px-2 py-1">
        Pinned
      </TooltipContent>
    </Tooltip>
  )
}
