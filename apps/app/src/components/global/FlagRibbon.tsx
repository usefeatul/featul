"use client"

import React from "react"
import { overlayRibbonInnerClass, overlayRibbonShellClass } from "@featul/ui/lib/overlay"
import { StarIcon } from "@featul/ui/icons/star"
import { PinIcon } from "@featul/ui/icons/pin"
import { StarPinIcon } from "@featul/ui/icons/star-pin"
import { LockIcon } from "@featul/ui/icons/lock"
import { cn } from "@featul/ui/lib/utils"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@featul/ui/components/tooltip"

interface FlagRibbonProps {
    isPinned?: boolean
    isFeatured?: boolean
    isLocked?: boolean
    className?: string
}

/**
 * Corner ribbon for post flags.
 * - Pinned: Primary ribbon
 * - Featured: Amber/gold ribbon
 * - Both: Gradient ribbon
 * - Locked (when not pinned/featured): Red ribbon
 */
export function FlagRibbon({ isPinned, isFeatured, isLocked, className = "" }: FlagRibbonProps) {
    const showPinOrFeature = Boolean(isPinned || isFeatured)
    if (!showPinOrFeature && !isLocked) return null

    const Icon = showPinOrFeature
        ? isPinned && isFeatured
            ? StarPinIcon
            : isPinned
                ? PinIcon
                : StarIcon
        : LockIcon

    const title = showPinOrFeature
        ? [
            isPinned && isFeatured ? "Pinned & Featured" : isPinned ? "Pinned" : "Featured",
            isLocked ? "Locked" : null,
          ].filter(Boolean).join(" · ")
        : "This post is locked"

    const ribbon = (
        <div
            className={cn(
                overlayRibbonShellClass,
                !showPinOrFeature && "pointer-events-auto",
                className,
            )}
            title={showPinOrFeature ? title : undefined}
        >
            <span
                className={cn(overlayRibbonInnerClass, {
                    "bg-linear-to-r from-primary to-amber-500": isPinned && isFeatured,
                    "bg-primary": isPinned && !isFeatured,
                    "bg-amber-500": !isPinned && isFeatured,
                    "bg-red-500": !showPinOrFeature && isLocked,
                })}
            >
                <Icon width={10} height={10} className="fill-current" />
            </span>
        </div>
    )

    if (showPinOrFeature) return ribbon

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
