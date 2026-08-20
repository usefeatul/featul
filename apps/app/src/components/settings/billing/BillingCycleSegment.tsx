"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import { type BillingCycle } from "./data"

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
      <TabsList className="h-auto w-auto gap-0 overflow-visible rounded-lg border border-border/60 bg-muted/30 p-0.5 dark:border-white/10 dark:bg-black/40 [&>div.pointer-events-none.absolute]:hidden">
        <TabsTrigger
          value="monthly"
          className={cn(
            "h-auto cursor-pointer rounded-md border-0 px-2.5 py-1 text-xs text-accent",
            billingCycle === "monthly" &&
              "bg-background text-foreground shadow-xs dark:bg-black/60",
          )}
        >
          Monthly
        </TabsTrigger>
        <TabsTrigger
          value="yearly"
          className={cn(
            "h-auto cursor-pointer rounded-md border-0 px-2.5 py-1 text-xs text-accent",
            billingCycle === "yearly" &&
              "bg-background text-foreground shadow-xs dark:bg-black/60",
          )}
        >
          Yearly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
