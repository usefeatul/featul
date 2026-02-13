"use client"

import React from "react"

interface FlagRibbonProps {
    isPinned?: boolean
    isFeatured?: boolean
    className?: string
}

/**
 * Corner ribbon component to indicate pinned/featured status on cards.
 * - Pinned: Primary blue ribbon
 * - Featured: Amber/gold ribbon
 * - Both: Gradient ribbon with star
 */
import { StarIcon } from "@featul/ui/icons/star"
import { PinIcon } from "@featul/ui/icons/pin"
import { StarPinIcon } from "@featul/ui/icons/star-pin"
import { cn } from "@featul/ui/lib/utils"

export function FlagRibbon({ isPinned, isFeatured, className = "" }: FlagRibbonProps) {
    if (!isPinned && !isFeatured) return null

    const Icon = isPinned && isFeatured ? StarPinIcon : isPinned ? PinIcon : StarIcon
    const title = isPinned && isFeatured ? "Pinned & Featured" : isPinned ? "Pinned" : "Featured"
    const ribbonSurfaceClassName = cn(
        "absolute inset-0 rounded-[1px] border border-border/80 dark:border-border/70 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)]",
        {
            "bg-linear-to-r from-primary to-amber-500": isPinned && isFeatured,
            "bg-primary": isPinned && !isFeatured,
            "bg-amber-500": !isPinned && isFeatured
        }
    )

    return (
        <div
            className={cn(
                "absolute -top-[19px] -right-[19px] w-[38px] h-[38px] rotate-45 flex items-end justify-center pb-1 pointer-events-none",
                className
            )}
            title={title}
        >
            <div className={ribbonSurfaceClassName} />
            <div className="relative z-10 text-white mb-px">
                <Icon width={10} height={10} className="fill-current" />
            </div>
        </div>
    )
}

export default FlagRibbon
