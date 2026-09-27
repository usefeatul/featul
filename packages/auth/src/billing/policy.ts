import type Stripe from "stripe"
import { getStripePlanNameFromPriceId } from "../stripe"

export type BillingPlan = "free" | "starter" | "professional"

type TrialHistory = {
  status: string | null
  trialStart?: Date | string | null
  trialEnd?: Date | string | null
  stripeSubscriptionId?: string | null
}

export function isWorkspaceTrialEligible(history: readonly TrialHistory[]) {
  // Match Better Auth's trial-history check across every plan and status,
  // including canceled trials. An existing subscription is a plan change,
  // not an opportunity to start a new trial.
  return !history.some((row) => row.trialStart || row.trialEnd || row.status === "trialing"
    || row.status === "active" || (row.stripeSubscriptionId && isUnfinishedSubscription(row.status)))
}

// Preserve the existing grace policy: past_due retains access until Stripe
// moves the subscription to unpaid/canceled. Paused subscriptions have no access.
export function hasPaidAccess(status: string | null | undefined) {
  return status === "active" || status === "trialing" || status === "past_due"
}

export function isUnfinishedSubscription(status: string | null | undefined) {
  return status !== "canceled" && status !== "incomplete_expired"
}

export function stripeId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id || ""
}

export function getSubscriptionProjection(live: Stripe.Subscription) {
  const matchedItem = live.items.data.find((item) => getStripePlanNameFromPriceId(item.price.id))
  const item = matchedItem || (!isUnfinishedSubscription(live.status) ? live.items.data[0] : undefined)
  const plan = matchedItem ? getStripePlanNameFromPriceId(matchedItem.price.id) : "free" as const
  if (!item || !plan) {
    throw new Error(`Stripe subscription ${live.id} has no configured billing price`)
  }
  const date = (value: number | null | undefined) => value ? new Date(value * 1000) : null
  return {
    plan,
    status: live.status,
    stripeCustomerId: stripeId(live.customer),
    stripeSubscriptionId: live.id,
    periodStart: date(item.current_period_start),
    periodEnd: date(item.current_period_end),
    cancelAtPeriodEnd: live.cancel_at_period_end,
    cancelAt: date(live.cancel_at),
    canceledAt: date(live.canceled_at),
    endedAt: date(live.ended_at),
    trialStart: date(live.trial_start),
    trialEnd: date(live.trial_end),
    billingInterval: item.price.recurring?.interval === "year" ? "year" as const : "month" as const,
    seats: item.quantity ?? 1,
    stripeScheduleId: stripeId(live.schedule) || null,
  }
}

export function strongestPlan(plans: BillingPlan[]): BillingPlan {
  if (plans.includes("professional")) return "professional"
  if (plans.includes("starter")) return "starter"
  return "free"
}

export function belongsToWorkspace(
  live: Stripe.Subscription,
  workspaceId: string,
  knownIds: ReadonlySet<string>,
) {
  const referenceId = live.metadata.referenceId
  if (knownIds.has(live.id) && referenceId && referenceId !== workspaceId) {
    throw new Error(`Stripe subscription ${live.id} has conflicting workspace metadata`)
  }
  return referenceId === workspaceId || knownIds.has(live.id)
}
