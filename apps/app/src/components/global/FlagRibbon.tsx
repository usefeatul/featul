"use client"

import React from "react"
import { overlayRibbonInnerClass, overlayRibbonShellClass } from "@featul/ui/lib/overlay"
import { StarIcon } from "@featul/ui/icons/star"
import { PinIcon } from "@featul/ui/icons/pin"
import { StarPinIcon } from "@featul/ui/icons/star-pin"
import { cn } from "@featul/ui/lib/utils"

interface FlagRibbonProps {
    isPinned?: boolean
    isFeatured?: boolean
    className?: string
}

/**
 * Corner ribbon component to indicate pinned/featured status on cards.
 * - Pinned: Primary ribbon
 * - Featured: Amber/gold ribbon
 * - Both: Gradient ribbon with star
 */
export function FlagRibbon({ isPinned, isFeatured, className = "" }: FlagRibbonProps) {
    if (!isPinned && !isFeatured) return null

    const Icon = isPinned && isFeatured ? StarPinIcon : isPinned ? PinIcon : StarIcon
    const title = isPinned && isFeatured ? "Pinned & Featured" : isPinned ? "Pinned" : "Featured"

    return (
        <div
            className={cn(overlayRibbonShellClass, className)}
            title={title}
        >
            <span
                className={cn(overlayRibbonInnerClass, {
                    "bg-linear-to-r from-primary to-amber-500": isPinned && isFeatured,
                    "bg-primary": isPinned && !isFeatured,
                    "bg-amber-500": !isPinned && isFeatured,
                })}
            >
                <Icon width={10} height={10} className="fill-current" />
            </span>
        </div>
    )
}

export default FlagRibbon
