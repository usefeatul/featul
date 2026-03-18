import { db, subscription, workspace } from "@featul/db"
import { desc, eq } from "drizzle-orm"
import { getStripeClient, getStripePlanNameFromSubscription } from "./stripe"

export type BillingSubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "past_due"
  | "trialing"
  | "unpaid"

export type BillingPlan = "free" | "starter" | "professional"

type BillingSubscriptionLike = {
  referenceId?: unknown
  plan?: unknown
  status?: unknown
}

type BillingSubscriptionRow = {
  plan: unknown
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  updatedAt: Date
  createdAt: Date
}

function normalizePlan(plan: unknown): BillingPlan | null {
  const value = String(plan || "").trim().toLowerCase()
  if (value === "free" || value === "starter" || value === "professional") {
    return value
  }
  return null
}

function isPaidStatus(status: unknown): status is Extract<BillingSubscriptionStatus, "active" | "past_due" | "trialing"> {
  return status === "active" || status === "past_due" || status === "trialing"
}

function isStripePaidStatus(status: unknown) {
  return status === "active" || status === "past_due" || status === "trialing"
}

function isMissingStripeSubscription(error: unknown) {
  if (!error || typeof error !== "object") return false

  const code = "code" in error ? String(error.code || "") : ""
  const statusCode = "statusCode" in error ? Number(error.statusCode) : NaN

  return code === "resource_missing" || statusCode === 404
}

async function getWorkspaceSubscriptionRows(workspaceId: string) {
  return db
    .select({
      plan: subscription.plan,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      updatedAt: subscription.updatedAt,
      createdAt: subscription.createdAt,
    })
    .from(subscription)
    .where(eq(subscription.referenceId, workspaceId))
    .orderBy(desc(subscription.updatedAt), desc(subscription.createdAt))
}

async function getVerifiedPaidPlan(row: BillingSubscriptionRow, workspaceId: string): Promise<BillingPlan | null> {
  const stripeSubscriptionId = String(row.stripeSubscriptionId || "").trim()
  if (!stripeSubscriptionId) return null

  const stripeClient = getStripeClient()
  if (!stripeClient) return null

  try {
    const liveSubscription = await stripeClient.subscriptions.retrieve(stripeSubscriptionId)
    if (!isStripePaidStatus(liveSubscription.status)) return null

    const metadataReferenceId = String(liveSubscription.metadata?.referenceId || "").trim()
    if (metadataReferenceId && metadataReferenceId !== workspaceId) return null

    const stripeCustomerId =
      typeof liveSubscription.customer === "string"
        ? liveSubscription.customer
        : liveSubscription.customer?.id
    const expectedCustomerId = String(row.stripeCustomerId || "").trim()
    if (expectedCustomerId && stripeCustomerId && expectedCustomerId !== stripeCustomerId) return null

    return getStripePlanNameFromSubscription(liveSubscription)
  } catch (error) {
    if (isMissingStripeSubscription(error)) {
      return null
    }
    throw error
  }
}

async function setWorkspacePlan(workspaceId: string, nextPlan: BillingPlan, currentPlan?: unknown) {
  const normalizedCurrentPlan = normalizePlan(currentPlan)

  if (normalizedCurrentPlan !== nextPlan) {
    await db
      .update(workspace)
      .set({ plan: nextPlan })
      .where(eq(workspace.id, workspaceId))
  }

  return nextPlan
}

export async function getEffectiveWorkspacePlan(workspaceId: string): Promise<BillingPlan> {
  const id = String(workspaceId || "").trim()
  if (!id) return "free"

  const rows = await getWorkspaceSubscriptionRows(id)
  for (const row of rows) {
    const verifiedPlan = await getVerifiedPaidPlan(row, id)
    if (verifiedPlan) {
      return verifiedPlan
    }
  }

  return "free"
}

export async function syncWorkspacePlan(workspaceId: string, currentPlan?: unknown): Promise<BillingPlan> {
  const id = String(workspaceId || "").trim()
  if (!id) return "free"

  const nextPlan = await getEffectiveWorkspacePlan(id)
  return setWorkspacePlan(id, nextPlan, currentPlan)
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

export async function syncWorkspacePlanFromSubscription(
  subscription: BillingSubscriptionLike | null | undefined
) {
  const referenceId = String(subscription?.referenceId || "").trim()
  if (!referenceId) return

  const nextPlan = isPaidStatus(subscription?.status)
    ? normalizePlan(subscription?.plan) || "free"
    : "free"

  await setWorkspacePlan(referenceId, nextPlan)
}
