"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import { StarIcon } from "@featul/ui/icons/star"

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
  const surfaceClassName = cn(
    "absolute inset-0 rounded-[1px] border border-border/80 dark:border-border/70 ring-1 ring-border/60 ring-offset-1 ring-offset-white before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:content-[''] before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.12)] dark:before:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.45)] dark:ring-offset-black",
    tone === "popular" ? "bg-primary" : "bg-amber-500",
  )

  return (
    <div
      className={cn(
        "pointer-events-none absolute -right-[19px] -top-[19px] z-10 flex h-[38px] w-[38px] rotate-45 items-end justify-center pb-1",
        className,
      )}
      title={label}
      aria-hidden="true"
    >
      <div className={surfaceClassName} />
      <div className="relative z-10 mb-px text-white">
        <StarIcon width={10} height={10} className="fill-current" />
      </div>
    </div>
  )
}
