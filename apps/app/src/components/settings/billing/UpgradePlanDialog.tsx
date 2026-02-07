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
      description="Pick a plan that fits your team. You can change or cancel anytime."
      width="wide"
    >
      <div className="space-y-6 p-1">
        <div className="flex justify-center">
          <BillingCycleToggle
            billingCycle={billingCycle}
            onChange={setBillingCycle}
          />
        </div>

        <div className="space-y-3">
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
  // Logic to determine if this is an upgrade or downgrade could go here, 
  // but for now we just show "Current" or "Upgrade" logic via the button.

  return (
    <div
      className={cn(
        "group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all hover:bg-muted/20",
        isCurrent ? "border-primary/50 bg-primary/5" : "border-border"
      )}
    >
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{plan.label}</span>
          {isCurrent && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              Current
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{plan.tagline}</div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {plan.features.slice(0, 3).map((feature, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
              <Check className="size-3 text-primary" />
              <span>{feature.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-3 min-w-[140px]">
        <div className="text-right">
          <div className="text-xl font-bold text-foreground">
            {formatPrice(plan, billingCycle)}
          </div>
          <div className="text-[11px] text-muted-foreground text-right">
            {billingCycle === "yearly" ? "billed yearly" : "billed monthly"}
          </div>
        </div>

        <BillingCheckoutButton
          plan={plan}
          billingCycle={billingCycle}
          isCurrent={isCurrent}
          workspaceId={workspaceId}
          className="w-full sm:w-auto h-9 text-xs"
        />
      </div>
    </div>
  )
}
