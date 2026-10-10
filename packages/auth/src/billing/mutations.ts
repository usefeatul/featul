import { and, eq } from "drizzle-orm"
import { db, workspace } from "@featul/db"
import { getStripeClient } from "../stripe"
import { ownsBillingLease, withBillingLock, type BillingLease } from "./lock"
import { isUnfinishedSubscription } from "./policy"
import { getBillingContext, syncBillingUnderLease } from "./sync"

export class BillingConflictError extends Error {}

async function expireWorkspaceCheckouts(lease: BillingLease) {
  const { customerIds, rows } = await getBillingContext(lease.workspaceId)
  const stripe = getStripeClient()
  if (!stripe && customerIds.size) throw new Error("Stripe billing is not configured")
  if (!stripe) return
  for (const customer of customerIds) {
    for await (const checkout of stripe.checkout.sessions.list({ customer, status: "open", limit: 100 })) {
      const referenceId = checkout.client_reference_id || checkout.metadata?.referenceId
      const knownRow = rows.some((row) => row.id === checkout.metadata?.subscriptionId)
      if (knownRow && referenceId && referenceId !== lease.workspaceId) throw new Error("Conflicting checkout workspace reference")
      if (referenceId === lease.workspaceId || knownRow) {
        // If completion wins this race, Stripe rejects expiration. Abort and
        // refresh on the next attempt instead of deleting/creating a second sub.
        await stripe.checkout.sessions.expire(checkout.id)
      }
    }
  }
}

export async function prepareWorkspaceCheckout(lease: BillingLease) {
  await expireWorkspaceCheckouts(lease)
  const billing = await syncBillingUnderLease(lease)
  const unfinished = billing.subscriptions.filter((row) => isUnfinishedSubscription(row.status))
  if (unfinished.length > 1) throw new BillingConflictError("Multiple subscriptions need attention. Please contact support.")
  const current = unfinished[0]
  if (current && current.status !== "active" && current.status !== "trialing") {
    throw new BillingConflictError("Manage your existing subscription in the billing portal before starting another checkout.")
  }
  return current?.stripeSubscriptionId
}

export async function deleteWorkspaceAfterBillingCheck(workspaceId: string) {
  return withBillingLock(workspaceId, async (lease) => {
    await expireWorkspaceCheckouts(lease)
    const billing = await syncBillingUnderLease(lease)
    if (billing.subscriptions.some((row) => isUnfinishedSubscription(row.status))) {
      throw new BillingConflictError("End your Stripe subscription before deleting this workspace. A subscription scheduled to cancel is still active until its end date.")
    }
    const deleted = await db.delete(workspace)
      .where(and(eq(workspace.id, workspaceId), ownsBillingLease(lease))).returning({ id: workspace.id })
    if (!deleted.length) throw new BillingConflictError("Billing changed. Please try again.")
  })
}
