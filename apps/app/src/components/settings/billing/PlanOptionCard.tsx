"use client"

import React from "react"
import { type PlanKey } from "@/lib/plan"
import { cn } from "@featul/ui/lib/utils"
import PlanFlagRibbon from "./PlanFlagRibbon"
import PlanCheckoutButton from "./PlanCheckoutButton"
import { type BillingCycle, getPlan } from "./billing-data"

type PlanOptionCardProps = {
  planKey: PlanKey
  currentPlan: PlanKey
  billingCycle: BillingCycle
  workspaceId?: string
}

export default function PlanOptionCard({
  planKey,
  currentPlan,
  billingCycle,
  workspaceId,
}: PlanOptionCardProps) {
  const plan = getPlan(planKey)
  const isCurrent = currentPlan === planKey
  const ribbon = getPlanRibbon(planKey)

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-md border bg-linear-to-b from-background via-background to-stone-100/90 p-4 dark:to-stone-900/75",
        planKey === "free"
          ? "border-border/70"
          : isCurrent
            ? "border-primary/60"
            : "border-border/70",
      )}
    >
      {ribbon ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-1",
            getRibbonSpotlightClass(ribbon.tone),
          )}
        />
      ) : null}
      {ribbon ? <PlanFlagRibbon label={ribbon.label} tone={ribbon.tone} /> : null}

      <div className="relative z-10 mb-3 flex items-start justify-between gap-2">
        <div className="relative z-10">
          <div className="text-2xl font-heading font-semibold leading-none text-foreground">
            {plan.label}
          </div>
          <div className="mt-1.5 text-sm leading-snug text-accent">{plan.tagline}</div>
        </div>
      </div>

      <div className="relative z-10 mb-4 text-4xl font-semibold tracking-tight text-foreground">
        {billingCycle === "yearly" ? `$${plan.yearlyPrice}` : `$${plan.monthlyPrice}`}
        <span className="ml-1 text-sm font-normal text-accent">
          /{billingCycle === "yearly" ? "year" : "mo"}
        </span>
      </div>

      <ul className="relative z-10 mb-4 flex-1 space-y-1.5 text-sm text-accent">
        {plan.features.map((feature) => (
          <li key={feature.title} className="leading-relaxed">
            {feature.title}
          </li>
        ))}
      </ul>

      <div className="relative z-10">
        <PlanCheckoutButton
          plan={plan}
          billingCycle={billingCycle}
          isCurrent={isCurrent}
          workspaceId={workspaceId}
          className="h-9 w-full text-sm"
        />
      </div>
    </div>
  )
}

function getPlanRibbon(planKey: PlanKey): { label: string; tone: "popular" | "value" } | null {
  if (planKey === "starter") return { label: "Most popular", tone: "popular" }
  if (planKey === "professional") return { label: "Best value", tone: "value" }
  return null
}

function getRibbonSpotlightClass(tone: "popular" | "value") {
  if (tone === "popular") {
    return "bg-[radial-gradient(340px_240px_at_100%_0%,var(--primary),transparent_58%)] opacity-30 dark:opacity-35"
  }
  return "bg-[radial-gradient(340px_240px_at_100%_0%,#f59e0b,transparent_58%)] opacity-30 dark:opacity-35"
}
