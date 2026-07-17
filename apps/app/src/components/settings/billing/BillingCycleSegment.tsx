"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import { type BillingCycle } from "./billing-data"

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
      <TabsList className="w-auto gap-0 overflow-visible rounded-md border border-border/70 bg-muted/40 p-0.5 pb-0 [&>div.pointer-events-none.absolute]:hidden">
        <TabsTrigger
          value="monthly"
          className={cn(
            "h-auto cursor-pointer rounded-md border-0 px-2 py-1 text-xs text-muted-foreground",
            billingCycle === "monthly" && "bg-card text-foreground dark:bg-black/50",
          )}
        >
          Monthly
        </TabsTrigger>
        <TabsTrigger
          value="yearly"
          className={cn(
            "h-auto cursor-pointer rounded-md border-0 px-2 py-1 text-xs text-muted-foreground",
            billingCycle === "yearly" && "bg-card text-foreground dark:bg-black/50",
          )}
        >
          Yearly
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
