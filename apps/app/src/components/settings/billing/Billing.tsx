"use client"

import React from "react"
import SectionCard from "../global/SectionCard"
import { authClient, useSession } from "@featul/auth/client"
import { toast } from "sonner"
import { LoadingButton } from "@/components/global/loading-button"
import { normalizePlan } from "@/lib/plan"
import BillingCycleSegment from "./BillingCycleSegment"
import PlanOptionCard from "./PlanOptionCard"
import { type BillingCycle, PLAN_ORDER, getPlan } from "./billing-data"
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog"

type BillingSubscription = {
  id: string
  plan: string
  status: string
  stripeSubscriptionId?: string | null
  billingInterval?: string | null
  periodEnd?: string | Date | null
  cancelAtPeriodEnd?: boolean | null
  trialEnd?: string | Date | null
}

type BillingSectionProps = {
  slug: string
  currentPlan?: string
  workspaceId?: string
  workspaceOwnerId?: string
  initialSubscription?: BillingSubscription | null
}

export default function BillingSection({
  slug,
  currentPlan,
  workspaceId,
  workspaceOwnerId,
  initialSubscription = null,
}: BillingSectionProps) {
  const normalizedPlan = normalizePlan(String(currentPlan || "free"))
  const activePlan = getPlan(normalizedPlan)
  const initialBillingCycle: BillingCycle =
    initialSubscription?.billingInterval === "year" ? "yearly" : "monthly"
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>(initialBillingCycle)
  const [subscription, setSubscription] = React.useState<BillingSubscription | null>(initialSubscription)
  const [isOpeningPortal, setIsOpeningPortal] = React.useState(false)
  const { data: session } = useSession()

  const isOwner = Boolean(
    workspaceOwnerId && session?.user?.id && workspaceOwnerId === session.user.id,
  )

  React.useEffect(() => {
    let cancelled = false

    async function loadSubscription() {
      if (!workspaceId || !isOwner) {
        if (!cancelled) setSubscription(null)
        return
      }

      try {
        const { data, error } = await authClient.subscription.list({
          query: {
            referenceId: workspaceId,
          },
        })

        if (cancelled) return
        if (error) {
          setSubscription(null)
          return
        }

        const subscriptions = Array.isArray(data) ? data : []
        setSubscription((subscriptions[0] as BillingSubscription | undefined) || null)
      } catch {
        if (!cancelled) setSubscription(null)
      }
    }

    loadSubscription()

    return () => {
      cancelled = true
    }
  }, [isOwner, workspaceId])

  const billingUrl = React.useMemo(() => `/workspaces/${slug}/settings/billing`, [slug])

  const handleOpenPortal = async () => {
    if (!workspaceId || !isOwner || isOpeningPortal) return

    try {
      setIsOpeningPortal(true)
      const returnUrl = `${window.location.origin}${billingUrl}`
      const { data, error } = await authClient.subscription.billingPortal({
        referenceId: workspaceId,
        returnUrl,
        disableRedirect: true,
      })

      if (error) {
        toast.error(error.message || "Failed to open billing portal")
        return
      }

      if (!data?.url) {
        toast.error("Billing portal URL missing")
        return
      }

      captureAnalyticsEvent(analyticsEvents.billingPortalOpened, {
        workspace_id: workspaceId,
        workspace_slug: slug,
      })
      window.location.href = data.url
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to open billing portal"
      toast.error(message)
    } finally {
      setIsOpeningPortal(false)
    }
  }

  const billingAction = subscription ? (
    <LoadingButton
      variant="nav"
      loading={isOpeningPortal}
      disabled={!isOwner || isOpeningPortal}
      onClick={handleOpenPortal}
      className="min-w-36"
    >
      Manage billing
    </LoadingButton>
  ) : null
  const currentBillingCycle: BillingCycle =
    subscription?.billingInterval === "year"
      ? "yearly"
      : subscription?.billingInterval === "month"
        ? "monthly"
        : billingCycle
  const currentAmount =
    currentBillingCycle === "yearly" ? activePlan.yearlyPrice : activePlan.monthlyPrice
  const currentSuffix = currentBillingCycle === "yearly" ? "/year" : "/mo"

  return (
    <SectionCard
      title="Subscription"
      description="Choose the plan that fits your workspace."
      action={billingAction}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-border/70 bg-background px-3 py-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-sm text-foreground">
              <span>Current:</span>
              <span className="font-heading font-medium text-accent">{activePlan.label}</span>
              <span className="font-heading text-accent">${currentAmount}</span>
              <span className="font-heading text-accent">{currentSuffix}</span>
            </div>
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
              workspaceSlug={slug}
              canManageBilling={isOwner}
              currentSubscriptionId={subscription?.stripeSubscriptionId || undefined}
            />
          ))}
        </div>
      </div>
    </SectionCard>
  )
}
