import { randomUUID } from "node:crypto"
import type Stripe from "stripe"
import { and, eq, isNull, sql } from "drizzle-orm"
import { billingEvent, db, subscription, workspace } from "@featul/db"
import { getStripeClient, getStripePlanNameFromItems } from "../stripe"
import { getBillingContext, syncWorkspaceBilling } from "./sync"
import { hasPaidAccess, stripeId } from "./policy"
import {
  getInvoiceSubscriptionId, sendFailedPaymentNotificationForInvoice,
  sendUpcomingPaymentNotificationForInvoice, sendWorkspaceUpgradeNotification,
} from "./notifications"
import { captureServerAnalyticsEvent } from "../posthog"

export const billingEvents = new Set<Stripe.Event.Type>([
  "checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed",
  "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted",
  "customer.subscription.paused", "customer.subscription.resumed", "customer.subscription.trial_will_end",
  "customer.subscription.pending_update_applied", "customer.subscription.pending_update_expired",
  "invoice.paid", "invoice.payment_failed", "invoice.payment_action_required", "invoice.upcoming",
  "invoice.marked_uncollectible",
])

export function eventSubscriptionId(event: Stripe.Event) {
  if (event.type.startsWith("customer.subscription.")) return (event.data.object as Stripe.Subscription).id
  if (event.type.startsWith("checkout.session.")) return stripeId((event.data.object as Stripe.Checkout.Session).subscription)
  if (event.type.startsWith("invoice.")) return getInvoiceSubscriptionId(event.data.object as Stripe.Invoice)
  return ""
}

async function applyBillingEvent(event: Stripe.Event) {
  const stripe = getStripeClient()
  if (!stripe) throw new Error("Stripe billing is not configured")
  const subscriptionId = eventSubscriptionId(event)
  if (!subscriptionId) return
  // Event data selects the resource; only a fresh Stripe read selects access.
  const live = await stripe.subscriptions.retrieve(subscriptionId)
  const [existing] = await db.select({ referenceId: subscription.referenceId }).from(subscription)
    .where(eq(subscription.stripeSubscriptionId, subscriptionId)).limit(1)
  const referenceId = live.metadata.referenceId || existing?.referenceId
  if (!referenceId) return // A subscription belonging to another integration.
  if (existing && existing.referenceId !== referenceId) throw new Error("Conflicting Stripe workspace reference")
  const [owner] = await db.select({ id: workspace.id }).from(workspace).where(eq(workspace.id, referenceId)).limit(1)
  if (!owner) return // Late event for a workspace that has already been deleted.
  const context = await getBillingContext(referenceId)
  if (!context.customerIds.has(stripeId(live.customer))) throw new Error("Stripe customer does not belong to this workspace")
  const billing = await syncWorkspaceBilling(referenceId)
  const current = billing.subscriptions.find((row) => row.stripeSubscriptionId === subscriptionId)
  if (!current) throw new Error("Stripe subscription was not synchronized")

  if (event.type === "invoice.payment_failed") {
    await sendFailedPaymentNotificationForInvoice(event, event.data.object)
  } else if (event.type === "invoice.upcoming") {
    await sendUpcomingPaymentNotificationForInvoice(event, event.data.object)
  } else if (current.plan !== "free" && hasPaidAccess(current.status)) {
    const initial = event.type === "checkout.session.completed" || event.type === "customer.subscription.created"
    const previousItems = event.type === "customer.subscription.updated" ? event.data.previous_attributes?.items?.data : undefined
    const previousPlan = getStripePlanNameFromItems(previousItems)
    if (initial || (previousPlan && previousPlan !== current.plan)) {
      await sendWorkspaceUpgradeNotification({
        workspaceId: referenceId, plan: current.plan, billingInterval: current.billingInterval,
        stripeSubscriptionId: subscriptionId,
        // Checkout and subscription-created describe the same initial activation.
        // Subsequent changes use the event ID so returning to a plan sends again.
        stripeEventId: initial ? `activation:${subscriptionId}` : event.id,
      })
      if (event.type === "checkout.session.completed") {
        await captureServerAnalyticsEvent("subscription_upgraded", `workspace:${referenceId}`, {
          workspace_id: referenceId, plan: current.plan, status: current.status, source: "stripe_complete",
          $insert_id: event.id,
        })
      }
    }
  }
}

export async function receiveBillingEvent(event: Stripe.Event) {
  if (!billingEvents.has(event.type)) return
  await db.insert(billingEvent).values({ id: event.id, payload: event as unknown as Record<string, unknown> }).onConflictDoNothing()
  await processBillingEvent(event.id)
}

export async function processBillingEvent(id: string) {
  const token = randomUUID()
  const [claimed] = await db.update(billingEvent).set({
    lockToken: token, lockedUntil: sql`now() + interval '2 minutes'`, attempts: sql`${billingEvent.attempts} + 1`,
  }).where(and(eq(billingEvent.id, id), isNull(billingEvent.completedAt),
    sql`${billingEvent.lockedUntil} is null or ${billingEvent.lockedUntil} < now()`)).returning()
  if (!claimed) return // Already complete or another worker holds the durable event.
  const guard = and(eq(billingEvent.id, id), eq(billingEvent.lockToken, token))
  try {
    await applyBillingEvent(claimed.payload as unknown as Stripe.Event)
    await db.update(billingEvent).set({ completedAt: new Date(), lockToken: null, lockedUntil: null }).where(guard)
  } catch (error) {
    await db.update(billingEvent).set({
      lockToken: null, lockedUntil: null,
      nextAttemptAt: new Date(Date.now() + Math.min(3600, 30 * 2 ** Math.min(claimed.attempts, 7)) * 1000),
    }).where(guard)
    throw error
  }
}
