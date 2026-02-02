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
import { Pin, Star } from "lucide-react"

export function FlagRibbon({ isPinned, isFeatured, className = "" }: FlagRibbonProps) {
    if (!isPinned && !isFeatured) return null

    return (
        <div
            className={`absolute -top-[19px] -right-[19px] w-[38px] h-[38px] rotate-45 z-10 flex items-end justify-center pb-1 shadow-sm pointer-events-none ${className}`}
            title={isPinned ? "Pinned" : "Featured"}
        >
            <div className={`
              absolute inset-0 shadow-sm
              ${isPinned && isFeatured ? "bg-gradient-to-r from-primary to-amber-500" : ""}
              ${isPinned && !isFeatured ? "bg-primary" : ""}
              ${!isPinned && isFeatured ? "bg-amber-500" : ""}
            `}
            />
            <div className="relative z-10 text-white transform rotate-0 mb-[1px]">
                {isPinned && isFeatured ? <Star className="size-2.5 fill-current" /> :
                    isPinned ? <Pin className="size-2.5 fill-current" /> :
                        <Star className="size-2.5 fill-current" />}
            </div>
        </div>
    )
}

export default FlagRibbon
