import { db, subscription as subscriptionTable, workspace } from "@featul/db"
import { eq } from "drizzle-orm"
import type { Subscription as PolarSubscription } from "@polar-sh/sdk/models/components/subscription"

export type PlanTier = "free" | "starter" | "professional"

const DEFAULT_PAID_PLAN: PlanTier = "starter"

const PRODUCT_ID_STARTER_MONTHLY = (process.env.POLAR_PRODUCT_ID_STARTER_MONTHLY || "").trim()
const PRODUCT_ID_STARTER_YEARLY = (process.env.POLAR_PRODUCT_ID_STARTER_YEARLY || "").trim()
const PRODUCT_ID_PROFESSIONAL_MONTHLY = (process.env.POLAR_PRODUCT_ID_PROFESSIONAL_MONTHLY || "").trim()
const PRODUCT_ID_PROFESSIONAL_YEARLY = (process.env.POLAR_PRODUCT_ID_PROFESSIONAL_YEARLY || "").trim()

const LEGACY_PRODUCT_ID_MONTHLY = (process.env.POLAR_PRODUCT_ID_MONTHLY || "").trim()
const LEGACY_PRODUCT_ID_YEARLY = (process.env.POLAR_PRODUCT_ID_YEARLY || "").trim()

const PRODUCT_PLAN_MAP = new Map<string, PlanTier>()
const PRODUCT_CYCLE_MAP = new Map<string, "monthly" | "yearly">()

function registerProduct(id: string, plan: PlanTier, cycle: "monthly" | "yearly") {
  if (!id) return
  PRODUCT_PLAN_MAP.set(id, plan)
  PRODUCT_CYCLE_MAP.set(id, cycle)
}

registerProduct(PRODUCT_ID_STARTER_MONTHLY, "starter", "monthly")
registerProduct(PRODUCT_ID_STARTER_YEARLY, "starter", "yearly")
registerProduct(PRODUCT_ID_PROFESSIONAL_MONTHLY, "professional", "monthly")
registerProduct(PRODUCT_ID_PROFESSIONAL_YEARLY, "professional", "yearly")

// Legacy env vars map to starter plan for backwards compatibility
registerProduct(LEGACY_PRODUCT_ID_MONTHLY, "starter", "monthly")
registerProduct(LEGACY_PRODUCT_ID_YEARLY, "starter", "yearly")

const HAS_PRODUCT_MAP = PRODUCT_PLAN_MAP.size > 0

const PLAN_ALIASES: Record<string, PlanTier> = {
  free: "free",
  starter: "starter",
  professional: "professional",
  pro: "professional",
  growth: "starter",
  enterprise: "professional",
  scale: "professional",
}

function normalizePlan(input: unknown): PlanTier | null {
  const value = String(input || "").trim().toLowerCase()
  return PLAN_ALIASES[value] || null
}

function resolvePlanFromMetadata(subscription: PolarSubscription): PlanTier | null {
  const meta = (subscription.metadata || {}) as Record<string, unknown>
  const productMeta = (subscription.product?.metadata || {}) as Record<string, unknown>
  return (
    normalizePlan(meta.plan) ||
    normalizePlan(productMeta.plan) ||
    normalizePlan(meta.tier) ||
    normalizePlan(productMeta.tier)
  )
}

function resolvePlan(subscription: PolarSubscription): PlanTier {
  const fromProduct = PRODUCT_PLAN_MAP.get(subscription.productId)
  if (fromProduct) return fromProduct
  const fromMetadata = resolvePlanFromMetadata(subscription)
  if (fromMetadata) return fromMetadata
  if (!HAS_PRODUCT_MAP) return DEFAULT_PAID_PLAN
  return "free"
}

function resolveBillingCycle(subscription: PolarSubscription): "monthly" | "yearly" {
  if (subscription.recurringInterval === "year") return "yearly"
  const mapped = PRODUCT_CYCLE_MAP.get(subscription.productId)
  if (mapped) return mapped
  return "monthly"
}

function mapStatus(
  status: PolarSubscription["status"]
): "active" | "canceled" | "incomplete" | "past_due" | "trialing" | "unpaid" {
  if (status === "incomplete_expired") return "incomplete"
  if (
    status === "active" ||
    status === "canceled" ||
    status === "incomplete" ||
    status === "past_due" ||
    status === "trialing" ||
    status === "unpaid"
  ) {
    return status
  }
  return "incomplete"
}

function extractWorkspaceId(subscription: PolarSubscription): string | null {
  const metadata = (subscription.metadata || {}) as Record<string, unknown>
  const raw =
    metadata.referenceId ?? metadata.workspaceId ?? metadata.workspace_id
  if (typeof raw === "string" && raw.trim()) return raw.trim()
  if (typeof raw === "number" || typeof raw === "boolean") return String(raw)
  return null
}

function extractPriceId(subscription: PolarSubscription): string | null {
  const price = Array.isArray(subscription.prices)
    ? subscription.prices.find(
        (entry) => entry && typeof (entry as { id?: unknown }).id === "string"
      )
    : undefined
  const id = (price as { id?: unknown } | undefined)?.id
  return typeof id === "string" && id.trim() ? id.trim() : null
}

function shouldKeepPaid(status: ReturnType<typeof mapStatus>): boolean {
  return status === "active" || status === "trialing" || status === "past_due"
}

export async function syncPolarSubscription(
  subscription: PolarSubscription
): Promise<void> {
  const workspaceId = extractWorkspaceId(subscription)
  if (!workspaceId) return

  const resolvedPlan = resolvePlan(subscription)
  const status = mapStatus(subscription.status)
  const billingCycle = resolveBillingCycle(subscription)
  const priceId = extractPriceId(subscription)

  const data = {
    plan: resolvedPlan,
    polarCustomerId: subscription.customerId,
    polarSubscriptionId: subscription.id,
    polarProductId: subscription.productId,
    polarPriceId: priceId,
    status,
    billingCycle,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
    trialStart: subscription.trialStart,
    trialEnd: subscription.trialEnd,
  }

  const existing = await db
    .select({ id: subscriptionTable.id })
    .from(subscriptionTable)
    .where(eq(subscriptionTable.workspaceId, workspaceId))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(subscriptionTable)
      .set(data)
      .where(eq(subscriptionTable.workspaceId, workspaceId))
  } else {
    await db.insert(subscriptionTable).values({
      workspaceId,
      ...data,
    })
  }

  const shouldFallbackPlan =
    resolvedPlan === "free" && shouldKeepPaid(status) && !HAS_PRODUCT_MAP
  const paidPlan = shouldFallbackPlan ? DEFAULT_PAID_PLAN : resolvedPlan
  const nextWorkspacePlan = shouldKeepPaid(status) ? paidPlan : "free"

  await db
    .update(workspace)
    .set({ plan: nextWorkspacePlan })
    .where(eq(workspace.id, workspaceId))
}
