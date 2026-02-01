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
export function FlagRibbon({ isPinned, isFeatured, className = "" }: FlagRibbonProps) {
    if (!isPinned && !isFeatured) return null

    const ribbonBg = isPinned && isFeatured
        ? "bg-gradient-to-r from-primary to-amber-500"
        : isPinned
            ? "bg-primary"
            : "bg-amber-500"

    const label = isPinned && isFeatured
        ? "★"
        : isPinned
            ? "Pinned"
            : "Featured"

    return (
        <div
            className={`absolute -right-8 top-3 w-24 text-center text-[10px] font-medium text-white py-0.5 rotate-45 shadow-sm ${ribbonBg} ${className}`}
            aria-label={isPinned && isFeatured ? "Pinned and Featured" : isPinned ? "Pinned" : "Featured"}
        >
            {label}
        </div>
    )
}

export default FlagRibbon
