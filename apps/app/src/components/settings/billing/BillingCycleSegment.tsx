"use client"

import React from "react"
import { SegmentedControl } from "@featul/ui/components/segmented-control"
import { type BillingCycle } from "./data"

const OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

type BillingCycleSegmentProps = {
  billingCycle: BillingCycle
  onChange: (value: BillingCycle) => void
}

export default function BillingCycleSegment({ billingCycle, onChange }: BillingCycleSegmentProps) {
  return (
    <SegmentedControl
      aria-label="Billing cycle"
      value={billingCycle}
      onValueChange={onChange}
      options={OPTIONS}
    />
  )
}
