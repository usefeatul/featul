"use client"

import React from "react"
import { overlayRibbonInnerClass, overlayRibbonShellClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@featul/ui/components/tooltip"
import {
  getActiveRequestFlags,
  getFlagRibbonIcon,
  getFlagRibbonToneClass,
  getRequestFlagTitle,
} from "./flag-visuals"

interface FlagRibbonProps {
    isPinned?: boolean
    isFeatured?: boolean
    isLocked?: boolean
    className?: string
}

/**
 * Corner ribbon for post flags.
 * Combinations use one merged glyph (star-pin, pin-lock, star-lock, or all three).
 */
export function FlagRibbon({ isPinned, isFeatured, isLocked, className = "" }: FlagRibbonProps) {
    const flags = { isPinned, isFeatured, isLocked }
    const active = getActiveRequestFlags(flags)
    if (active.length === 0) return null

    const title = getRequestFlagTitle(flags)
    const Icon = getFlagRibbonIcon(active)

    const ribbon = (
        <div
            className={cn(overlayRibbonShellClass, "pointer-events-auto", className)}
            aria-label={title}
        >
            <span className={cn(overlayRibbonInnerClass, getFlagRibbonToneClass(active))}>
                <Icon width={10} height={10} className="fill-current" />
            </span>
        </div>
    )

    return (
        <Tooltip>
            <TooltipTrigger asChild>{ribbon}</TooltipTrigger>
            <TooltipContent
                side="left"
                sideOffset={6}
                className="w-auto whitespace-nowrap px-2 py-1 text-xs"
            >
                {title}
            </TooltipContent>
        </Tooltip>
    )
}

export default FlagRibbon
