"use client"

import React from "react"
import { type PlanKey } from "@/lib/plan"
import { cn } from "@featul/ui/lib/utils"
import {
  settingsPlanCardCurrentClass,
  settingsPlanCardShellClass,
} from "../global/SectionCard"
import PlanFlagRibbon from "./PlanFlagRibbon"
import PlanCheckoutButton from "./PlanCheckoutButton"
import { type BillingCycle, getPlan } from "./data"

type PlanOptionCardProps = {
  planKey: PlanKey
  currentPlan: PlanKey
  billingCycle: BillingCycle
  workspaceId?: string
  workspaceSlug: string
  canManageBilling: boolean
  currentSubscriptionId?: string
}

export default function PlanOptionCard({
  planKey,
  currentPlan,
  billingCycle,
  workspaceId,
  workspaceSlug,
  canManageBilling,
  currentSubscriptionId,
}: PlanOptionCardProps) {
  const plan = getPlan(planKey)
  const isCurrent = currentPlan === planKey
  const ribbon = getPlanRibbon(planKey)

  return (
    <div
      className={cn(
        settingsPlanCardShellClass,
        isCurrent && settingsPlanCardCurrentClass,
      )}
    >
      {ribbon ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-1",
            "bg-[radial-gradient(340px_240px_at_100%_0%,var(--primary),transparent_58%)] opacity-20 dark:opacity-25",
          )}
        />
      ) : null}
      {ribbon ? <PlanFlagRibbon label={ribbon.label} tone={ribbon.tone} /> : null}

      <div className="relative z-10 mb-3">
        <div className="text-2xl font-heading font-semibold leading-none text-foreground">
          {plan.label}
        </div>
        <div className="mt-1.5 text-sm leading-snug text-accent">{plan.tagline}</div>
      </div>

      <div className="relative z-10 mb-4">
        <div className="text-4xl font-semibold tracking-tight text-foreground">
          {billingCycle === "yearly" ? `$${plan.yearlyPrice}` : `$${plan.monthlyPrice}`}
          <span className="ml-1 text-sm font-normal text-accent">
            /{billingCycle === "yearly" ? "year" : "mo"}
          </span>
        </div>
        {plan.trialDays ? (
          <div className="mt-1 text-sm font-medium text-foreground">
            {plan.trialDays}-day free trial
          </div>
        ) : null}
      </div>

      <ul className="relative z-10 mb-5 flex-1 space-y-1.5 text-sm leading-relaxed text-accent">
        {plan.features.map((feature) => (
          <li key={feature.title}>{feature.title}</li>
        ))}
      </ul>

      <div className="relative z-10 mt-auto">
        <PlanCheckoutButton
          plan={plan}
          billingCycle={billingCycle}
          isCurrent={isCurrent}
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
          canManageBilling={canManageBilling}
          currentSubscriptionId={currentSubscriptionId}
          className="h-9 w-full text-sm"
        />
      </div>
    </div>
  )
}

function getPlanRibbon(planKey: PlanKey): { label: string; tone: "popular" } | null {
  if (planKey === "professional") return { label: "Most popular", tone: "popular" }
  return null
}
