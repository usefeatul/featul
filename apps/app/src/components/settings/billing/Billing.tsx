"use client"

import React from "react"
import SectionCard from "../global/SectionCard"
import { normalizePlan } from "@/lib/plan"
import BillingCycleSegment from "./BillingCycleSegment"
import PlanOptionCard from "./PlanOptionCard"
import { type BillingCycle, PLAN_ORDER, formatPrice, getPlan } from "./billing-data"

type BillingSectionProps = {
  currentPlan?: string
  workspaceId?: string
}

export default function BillingSection({ currentPlan, workspaceId }: BillingSectionProps) {
  const normalizedPlan = normalizePlan(String(currentPlan || "free"))
  const activePlan = getPlan(normalizedPlan)
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly")

  return (
    <SectionCard
      title="Subscription"
      description="Choose the plan that fits your workspace."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-background px-3 py-2.5">
          <div className="text-sm text-foreground">
            <span className="text-muted-foreground">Current:</span>{" "}
            <span className="font-medium">{activePlan.label}</span>{" "}
            <span className="text-muted-foreground">({formatPrice(activePlan, billingCycle)})</span>
          </div>
          <BillingCycleSegment billingCycle={billingCycle} onChange={setBillingCycle} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {PLAN_ORDER.map((planKey) => (
            <PlanOptionCard
              key={planKey}
              planKey={planKey}
              currentPlan={normalizedPlan}
              billingCycle={billingCycle}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      </div>
    </SectionCard>
  )
}
