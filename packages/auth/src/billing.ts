import { billingState, db, workspace } from "@featul/db"
import { eq } from "drizzle-orm"
import { setTimeout as delay } from "node:timers/promises"
import type Stripe from "stripe"
import { getComplimentaryWorkspacePlan } from "./billing/complimentary"
import { syncWorkspaceBilling } from "./billing/sync"
import type { BillingPlan } from "./billing/policy"
import { BillingBusyError } from "./billing/lock"

export type { BillingPlan } from "./billing/policy"
export type BillingSubscriptionStatus = Stripe.Subscription.Status

const FRESH_FOR_MS = 5 * 60 * 1000
const OUTAGE_GRACE_MS = 24 * 60 * 60 * 1000

export async function getEffectiveWorkspacePlan(workspaceId: string): Promise<BillingPlan> {
  const id = workspaceId.trim()
  if (!id) return "free"
  const complimentary = getComplimentaryWorkspacePlan(id)
  if (complimentary) return complimentary

  const [cached] = await db.select().from(billingState).where(eq(billingState.workspaceId, id)).limit(1)
  const age = cached?.syncedAt ? Date.now() - cached.syncedAt.getTime() : Infinity
  if (cached && age < FRESH_FOR_MS) return cached.plan
  // Do not make every feature request retry Stripe during a short outage or
  // while another request is already refreshing the same workspace.
  if (cached?.attemptedAt && age < OUTAGE_GRACE_MS && Date.now() - cached.attemptedAt.getTime() < 30_000) return cached.plan
  try {
    return (await syncWorkspaceBilling(id)).plan
  } catch (error) {
    // Keep previously verified access during a short Stripe outage. Never turn
    // a failed read into a free-plan write or grant access from unverified rows.
    if (cached && age < OUTAGE_GRACE_MS) {
      console.warn("[billing] Using last verified plan", { workspaceId: id, error })
      return cached.plan
    }
    // Parallel server renders can race on the first refresh after deployment.
    // Briefly wait for the lease holder to publish instead of failing a cold read.
    if (error instanceof BillingBusyError) {
      for (let attempt = 0; attempt < 10; attempt++) {
        await delay(200)
        const [fresh] = await db.select().from(billingState).where(eq(billingState.workspaceId, id)).limit(1)
        if (fresh?.syncedAt && Date.now() - fresh.syncedAt.getTime() < FRESH_FOR_MS) return fresh.plan
      }
    }
    throw error
  }
}

export async function syncWorkspacePlan(workspaceId: string): Promise<BillingPlan> {
  return (await syncWorkspaceBilling(workspaceId)).plan
}

export async function getWorkspaceBillingOwner(workspaceId: string) {
  const id = String(workspaceId || "").trim()
  if (!id) return null

  const [row] = await db
    .select({ id: workspace.id, ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.id, id))
    .limit(1)

  return row || null
}

export async function isWorkspaceBillingOwner(workspaceId: string, userId: string) {
  const row = await getWorkspaceBillingOwner(workspaceId)
  return Boolean(row && row.ownerId === userId)
}
