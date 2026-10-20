"use client"

import React from "react"
import { MotionConfig, motion } from "framer-motion"
import { cn } from "@featul/ui/lib/utils"
import { raisedSurfaceClass } from "@featul/ui/lib/overlay"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import { type BillingCycle } from "./data"

const OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

const squircleClass =
  "[corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.5)]"

type BillingCycleSegmentProps = {
  billingCycle: BillingCycle
  onChange: (value: BillingCycle) => void
}

export default function BillingCycleSegment({ billingCycle, onChange }: BillingCycleSegmentProps) {
  const pillId = React.useId()
  const handleValueChange = React.useCallback((value: string) => {
    if (value === "monthly" || value === "yearly") {
      onChange(value)
    }
  }, [onChange])

  return (
    <MotionConfig reducedMotion="user">
      <Tabs value={billingCycle} onValueChange={handleValueChange} className="gap-0">
        <TabsList className="h-auto w-auto gap-0.5 overflow-visible rounded-lg border border-border/70 bg-muted/40 p-0.5 [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*2)] dark:border-white/[0.06] dark:bg-black/20 [&>div.pointer-events-none.absolute]:hidden">
          {OPTIONS.map((option) => {
            const active = billingCycle === option.value
            return (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className={cn(
                  "relative h-auto cursor-pointer rounded-md border-0 px-2.5 py-1 text-xs text-accent transition-colors duration-200 hover:text-foreground",
                  squircleClass,
                  active && "text-foreground",
                )}
              >
                {/* The selected option's button surface slides between options. */}
                {active ? (
                  <motion.span
                    layoutId={pillId}
                    aria-hidden
                    className={cn(raisedSurfaceClass, "absolute inset-0 rounded-md", squircleClass)}
                    transition={{ type: "spring", stiffness: 520, damping: 40, mass: 0.8 }}
                  />
                ) : null}
                <span className="relative">{option.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </MotionConfig>
  )
}
