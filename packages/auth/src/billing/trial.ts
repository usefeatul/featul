import { randomUUID } from "node:crypto"
import { and, eq, sql } from "drizzle-orm"
import { billingAccount, db, subscription, user, workspace } from "@featul/db"
import { getStripeClient } from "../stripe"
import { BillingBusyError } from "./lock"

export async function markAccountTrialUsed(userId: string) {
  await db.insert(billingAccount).values({ userId, trialUsedAt: new Date() })
    .onConflictDoUpdate({ target: billingAccount.userId, set: { trialUsedAt: sql`coalesce(${billingAccount.trialUsedAt}, now())` } })
}

async function accountBillingHistory(userId: string) {
  const [owner] = await db.select({ customerId: user.stripeCustomerId }).from(user).where(eq(user.id, userId))
  if (!owner) throw new Error("Billing account not found")
  const rows = await db.select({
    customerId: subscription.stripeCustomerId, trialStart: subscription.trialStart,
    trialEnd: subscription.trialEnd, status: subscription.status,
  }).from(subscription).innerJoin(workspace, eq(subscription.referenceId, workspace.id))
    .where(eq(workspace.ownerId, userId))
  const customerIds = new Set([owner.customerId, ...rows.map((row) => row.customerId)]
    .filter((id): id is string => Boolean(id?.startsWith("cus_"))))
  return { rows, customerIds }
}

export async function isAccountTrialEligible(userId: string) {
  const [account] = await db.select({ usedAt: billingAccount.trialUsedAt }).from(billingAccount)
    .where(eq(billingAccount.userId, userId))
  if (account?.usedAt) return false
  const { rows, customerIds } = await accountBillingHistory(userId)
  if (rows.some((row) => row.trialStart || row.trialEnd || row.status === "trialing")) {
    await markAccountTrialUsed(userId)
    return false
  }
  // Stripe retains canceled subscriptions after a workspace is deleted and
  // also catches a completed checkout whose webhook has not arrived yet.
  const stripe = getStripeClient()
  if (customerIds.size && !stripe) throw new Error("Stripe billing is not configured")
  for (const customer of customerIds) {
    for await (const live of stripe!.subscriptions.list({ customer, status: "all", limit: 100 })) {
      if (live.trial_start || live.trial_end || live.status === "trialing") {
        await markAccountTrialUsed(userId)
        return false
      }
    }
  }
  return true
}

// Serialize checkout creation across all workspaces belonging to this account.
export async function withAccountCheckoutLock<T>(userId: string, work: () => Promise<T>) {
  const token = randomUUID()
  const [claimed] = await db.insert(billingAccount).values({
    userId, lockToken: token, lockedUntil: sql`now() + interval '2 minutes'`,
  }).onConflictDoUpdate({
    target: billingAccount.userId,
    set: { lockToken: token, lockedUntil: sql`now() + interval '2 minutes'` },
    setWhere: sql`${billingAccount.lockedUntil} is null or ${billingAccount.lockedUntil} < now()`,
  }).returning({ id: billingAccount.userId })
  if (!claimed) throw new BillingBusyError()
  try {
    return await work()
  } finally {
    await db.update(billingAccount).set({ lockToken: null, lockedUntil: null })
      .where(and(eq(billingAccount.userId, userId), eq(billingAccount.lockToken, token)))
  }
}

export async function expireAccountCheckouts(userId: string) {
  const { customerIds } = await accountBillingHistory(userId)
  const stripe = getStripeClient()
  if (customerIds.size && !stripe) throw new Error("Stripe billing is not configured")
  for (const customer of customerIds) {
    for await (const checkout of stripe!.checkout.sessions.list({ customer, status: "open", limit: 100 })) {
      if (checkout.mode === "subscription" && checkout.metadata?.userId === userId) {
        // If completion races expiration, Stripe rejects it and this checkout
        // attempt aborts. A retry reads the newly created subscription first.
        await stripe!.checkout.sessions.expire(checkout.id)
      }
    }
  }
}

export async function getAccountTrialCheckoutParams(userId: string, referenceId: string, subscriptionId: string, days?: number) {
  const eligible = Boolean(days) && await isAccountTrialEligible(userId)
  return {
    payment_method_collection: eligible ? "if_required" as const : "always" as const,
    // Replace the plugin's workspace-scoped subscription_data completely,
    // retaining the metadata required by webhook synchronization.
    subscription_data: {
      ...(eligible ? { trial_period_days: days } : {}),
      metadata: { userId, referenceId, subscriptionId },
    },
  }
}
