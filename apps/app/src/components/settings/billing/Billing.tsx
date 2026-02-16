"use client"

import React from "react"
import SectionCard from "../global/SectionCard"
import { normalizePlan, type PlanKey } from "@/lib/plan"
import { CreditCard } from "lucide-react"
import { LoadingButton } from "@/components/global/loading-button"
import UpgradePlanDialog from "./UpgradePlanDialog"
import { formatPrice, getPlan } from "./billing-data"

type BillingSectionProps = {
  currentPlan?: string
  workspaceId?: string
}

export default function BillingSection({ currentPlan, workspaceId }: BillingSectionProps) {
  const normalizedPlan = normalizePlan(String(currentPlan || "free"))
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <>
      <SectionCard
        title="Manage your plan"
        description="Update your payment information or switch plans."
      >
        <PlanSummaryCard planKey={normalizedPlan} onUpgradeClick={() => setDialogOpen(true)} />
      </SectionCard>

      <UpgradePlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPlan={normalizedPlan}
        workspaceId={workspaceId}
      />
    </>
  )
}

type PlanSummaryCardProps = {
  planKey: PlanKey
  onUpgradeClick: () => void
}

function PlanSummaryCard({ planKey, onUpgradeClick }: PlanSummaryCardProps) {
  const plan = getPlan(planKey)

  return (
    <div className="space-y-3 text-foreground">
      <div className="flex items-center justify-between rounded-md border border-border/70 bg-background px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-muted/80 text-foreground">
            <CreditCard className="size-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-foreground">
              {plan.label} Plan
            </div>
            <div className="text-xs text-accent">{formatPrice(plan, "monthly")}</div>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-md border border-border/70 bg-muted/70 text-foreground">
          Current
        </span>
      </div>
      <div className="pt-1">
        <LoadingButton onClick={onUpgradeClick}>
          Upgrade Plan
        </LoadingButton>
      </div>
    </div>
  )
}
