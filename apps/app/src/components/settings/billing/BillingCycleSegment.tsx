"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import { raisedSurfaceClass } from "@featul/ui/lib/overlay"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import { type BillingCycle } from "./data"

// The selected option uses the button's raised surface; the rest keep a transparent border so nothing shifts.
const triggerClass =
  "h-auto cursor-pointer rounded-md border border-transparent px-2.5 py-1 text-xs text-accent [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*1.5)]"

type BillingCycleSegmentProps = {
  billingCycle: BillingCycle
  onChange: (value: BillingCycle) => void
}

export default function BillingCycleSegment({ billingCycle, onChange }: BillingCycleSegmentProps) {
  const handleValueChange = React.useCallback((value: string) => {
    if (value === "monthly" || value === "yearly") {
      onChange(value)
    }
  }, [onChange])

  return (
    <Tabs value={billingCycle} onValueChange={handleValueChange} className="gap-0">
      <TabsList className="h-auto w-auto gap-0.5 overflow-visible rounded-lg border border-border/70 bg-muted/40 p-0.5 [corner-shape:squircle] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*2)] dark:border-white/[0.06] dark:bg-black/20 [&>div.pointer-events-none.absolute]:hidden">
        <TabsTrigger
          value="monthly"
          className={cn(
            triggerClass,
            billingCycle === "monthly" && cn(raisedSurfaceClass, "text-foreground"),
          )}
        >
          Monthly
        </TabsTrigger>
        <TabsTrigger
          value="yearly"
          className={cn(
            triggerClass,
            billingCycle === "yearly" && cn(raisedSurfaceClass, "text-foreground"),
          )}
        >
          Yearly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
