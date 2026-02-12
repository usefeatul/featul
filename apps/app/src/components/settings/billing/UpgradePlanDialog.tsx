"use client"

import React from "react"
import { SettingsDialogShell } from "../global/SettingsDialogShell"
import { Switch } from "@featul/ui/components/switch"
import { cn } from "@featul/ui/lib/utils"
import { Check } from "lucide-react"
import type { PlanKey } from "@/lib/plan"
import BillingCheckoutButton from "./BillingCheckoutButton"
import {
  type BillingCycle,
  PLAN_ORDER,
  formatPrice,
  getPlan,
} from "./billing-data"
import { Badge } from "@featul/ui/components/badge"

type UpgradePlanDialogProps = {
  open: boolean
  onOpenChange: (value: boolean) => void
  currentPlan: PlanKey
  workspaceId?: string
}

export default function UpgradePlanDialog({
  open,
  onOpenChange,
  currentPlan,
  workspaceId,
}: UpgradePlanDialogProps) {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly")

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Upgrade your workspace"
      width="xl"
    >
      <div className="space-y-8 p-1">
        <div className="flex justify-center">
          <BillingCycleToggle
            billingCycle={billingCycle}
            onChange={setBillingCycle}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_ORDER.map((planKey) => (
            <PlanCard
              key={planKey}
              planKey={planKey}
              currentPlan={currentPlan}
              billingCycle={billingCycle}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      </div>
    </SettingsDialogShell>
  )
}

type BillingCycleToggleProps = {
  billingCycle: BillingCycle
  onChange: (value: BillingCycle) => void
}

function BillingCycleToggle({ billingCycle, onChange }: BillingCycleToggleProps) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-muted/40 px-3 py-1.5">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Monthly
      </span>
      <Switch
        checked={billingCycle === "yearly"}
        onCheckedChange={(checked) => onChange(checked ? "yearly" : "monthly")}
      />
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Yearly <span className="text-xs text-emerald-500 font-normal ml-1">-20%</span>
      </span>
    </div>
  )
}

type PlanCardProps = {
  planKey: PlanKey
  currentPlan: PlanKey
  billingCycle: BillingCycle
  workspaceId?: string
}

function PlanCard({
  planKey,
  currentPlan,
  billingCycle,
  workspaceId,
}: PlanCardProps) {
  const plan = getPlan(planKey)
  const isCurrent = planKey === currentPlan

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border p-5 transition-all h-full bg-card",
        isCurrent ? "border-primary/50 shadow-sm ring-1 ring-primary/20" : "border-border hover:border-primary/30"
      )}
    >
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground text-lg">{plan.label}</span>
          {isCurrent && (
            <Badge variant="secondary" className="text-xs px-2 h-5">
              Current
            </Badge>
          )}
        </div>
        <div className="min-h-[40px] text-sm text-muted-foreground leading-snug">
          {plan.tagline}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground tracking-tight">
            {billingCycle === "yearly" ? `$${plan.yearlyPrice}` : `$${plan.monthlyPrice}`}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            /{billingCycle === "yearly" ? "year" : "mo"}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            <Check className="size-4 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground/90">{feature.title}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <BillingCheckoutButton
          plan={plan}
          billingCycle={billingCycle}
          isCurrent={isCurrent}
          workspaceId={workspaceId}
          className="w-full"
        />
      </div>
    </div>
  )
}
