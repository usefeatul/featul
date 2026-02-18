"use client"

import React from "react"
import { authClient } from "@featul/auth/client"
import SectionCard from "../global/SectionCard"
import { normalizePlan, type PlanKey } from "@/lib/plan"
import { cn } from "@featul/ui/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@featul/ui/components/tabs"
import { toast } from "sonner"
import { LoadingButton } from "@/components/global/loading-button"
import PlanFlagRibbon from "../billing/PlanFlagRibbon"
import { type BillingCycle, type PlanOption, PLAN_ORDER, formatPrice, getCheckoutSlug, getPlan } from "./billing-data"

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

type BillingCycleSegmentProps = {
  billingCycle: BillingCycle
  onChange: (value: BillingCycle) => void
}

function BillingCycleSegment({ billingCycle, onChange }: BillingCycleSegmentProps) {
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

type PlanOptionCardProps = {
  planKey: PlanKey
  currentPlan: PlanKey
  billingCycle: BillingCycle
  workspaceId?: string
}

function PlanOptionCard({
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
        "relative flex h-full flex-col overflow-hidden rounded-md border bg-gradient-to-b from-background via-background to-stone-100/90 p-4 dark:to-stone-900/75",
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
            "pointer-events-none absolute inset-0 z-[1]",
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

type PlanCheckoutButtonProps = {
  plan: PlanOption
  billingCycle: BillingCycle
  isCurrent: boolean
  workspaceId?: string
  className?: string
}

function PlanCheckoutButton({
  plan,
  billingCycle,
  isCurrent,
  workspaceId,
  className,
}: PlanCheckoutButtonProps) {
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)
  const isFreePlan = plan.id === "free"

  const handleCheckout = async () => {
    if (isCheckingOut) return
    if (!workspaceId) {
      toast.error("Workspace not found")
      return
    }

    const slug = getCheckoutSlug(plan.id, billingCycle)
    if (!slug) {
      toast.error("Free plan doesn't require checkout")
      return
    }

    try {
      setIsCheckingOut(true)
      const { error, data } = await authClient.checkout({
        slug,
        referenceId: workspaceId,
        metadata: {
          plan: plan.id,
          billingCycle,
        },
        redirect: false,
      })

      if (error) {
        toast.error(error.message || "Failed to start checkout")
        return
      }

      const url =
        data && typeof data === "object" && "url" in data
          ? String((data as { url?: string }).url || "")
          : ""
      if (!url) {
        toast.error("Checkout URL missing")
        return
      }
      window.location.href = url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start checkout"
      toast.error(message)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (isCurrent) {
    return (
      <LoadingButton variant="nav" disabled className={cn("opacity-50", className)}>
        Current
      </LoadingButton>
    )
  }

  if (isFreePlan) {
    return (
      <LoadingButton variant="nav" disabled className={cn("opacity-50", className)}>
        Free plan
      </LoadingButton>
    )
  }

  return (
    <LoadingButton
      className={cn(className)}
      loading={isCheckingOut}
      disabled={isCurrent || isCheckingOut}
      onClick={handleCheckout}
    >
      Choose plan
    </LoadingButton>
  )
}

function getPlanRibbon(planKey: PlanKey): { label: string; tone: "popular" | "value" } | null {
  if (planKey === "starter") return { label: "Most popular", tone: "popular" }
  if (planKey === "professional") return { label: "Best value", tone: "value" }
  return null
}

function getRibbonSpotlightClass(tone: "popular" | "value") {
  if (tone === "popular") {
    return "bg-[radial-gradient(340px_240px_at_100%_0%,rgba(132,204,22,0.22),transparent_58%)] dark:bg-[radial-gradient(340px_240px_at_100%_0%,rgba(132,204,22,0.24),transparent_55%)]"
  }
  return "bg-[radial-gradient(340px_240px_at_100%_0%,rgba(245,158,11,0.24),transparent_58%)] dark:bg-[radial-gradient(340px_240px_at_100%_0%,rgba(245,158,11,0.26),transparent_55%)]"
}
