"use client"

import React from "react"
import { overlayRibbonInnerClass, overlayRibbonShellClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import { StarIcon } from "@/components/global/icons"

type PlanFlagRibbonTone = "popular" | "value"

type PlanFlagRibbonProps = {
  label: string
  tone: PlanFlagRibbonTone
  className?: string
}

export default function PlanFlagRibbon({
  label,
  tone,
  className,
}: PlanFlagRibbonProps) {
  return (
    <div
      className={cn(overlayRibbonShellClass, className)}
      title={label}
      aria-hidden="true"
    >
      <span
        className={cn(
          overlayRibbonInnerClass,
          tone === "value" ? "bg-orange-500" : "bg-blue-500",
        )}
      >
        <StarIcon width={10} height={10} className="fill-current" />
      </span>
    </div>
  )
}
