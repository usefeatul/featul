import { randomUUID } from "node:crypto"
import { and, eq, sql } from "drizzle-orm"
import { billingState, db, subscription, user, workspace } from "@featul/db"
import { getStripeClient } from "../stripe"
import { getComplimentarySubscriptionPlan, getComplimentaryWorkspacePlan } from "./complimentary"
import { BillingBusyError, ownsBillingLease, withBillingLock, type BillingLease } from "./lock"
import { belongsToWorkspace, getSubscriptionProjection, hasPaidAccess, strongestPlan, type BillingPlan } from "./policy"

export async function getBillingContext(workspaceId: string) {
  const [owner] = await db.select({
    id: workspace.id, slug: workspace.slug, ownerId: workspace.ownerId,
    stripeCustomerId: user.stripeCustomerId,
  }).from(workspace).innerJoin(user, eq(workspace.ownerId, user.id))
    .where(eq(workspace.id, workspaceId)).limit(1)
  if (!owner) throw new Error("Workspace not found")
  const rows = await db.select().from(subscription).where(eq(subscription.referenceId, workspaceId))
  const customerIds = new Set([owner.stripeCustomerId, ...rows.map((row) => row.stripeCustomerId)]
    .filter((id): id is string => Boolean(id?.startsWith("cus_"))))
  return { owner, rows, customerIds }
}

function overridePlan(row: Awaited<ReturnType<typeof getBillingContext>>["rows"][number]): BillingPlan | null {
  const complimentary = getComplimentarySubscriptionPlan(row)
  if (complimentary) return complimentary
  if (process.env.NODE_ENV !== "production" && process.env.DEV_PLAN_OVERRIDE === "true"
    && row.stripeSubscriptionId?.startsWith("dev_sub_") && hasPaidAccess(row.status)) return row.plan
  return null
}

// Caller must hold the lease across the Stripe read and the atomic projection write.
export async function syncBillingUnderLease(lease: BillingLease) {
  const { workspaceId } = lease
  const context = await getBillingContext(workspaceId)
  const stripe = getStripeClient()
  if (!stripe && context.customerIds.size) throw new Error("Stripe billing is not configured")
  const knownIds = new Set(context.rows.map((row) => row.stripeSubscriptionId).filter((id): id is string => Boolean(id?.startsWith("sub_"))))
  const liveSubscriptions = []
  if (stripe) {
    for (const customer of context.customerIds) {
      for await (const live of stripe.subscriptions.list({ customer, status: "all", limit: 100 })) {
        if (belongsToWorkspace(live, workspaceId, knownIds)) liveSubscriptions.push(live)
      }
    }
    // Legacy records without a customer binding still get verified by exact ID.
    for (const id of knownIds) {
      if (liveSubscriptions.some((live) => live.id === id)) continue
      const live = await stripe.subscriptions.retrieve(id)
      if (!belongsToWorkspace(live, workspaceId, knownIds)) continue
      liveSubscriptions.push(live)
    }
  } else if (knownIds.size) {
    throw new Error("Stripe billing is not configured")
  }

  const claimedRowIds = new Set<string>()
  const projections = liveSubscriptions.map((live) => {
    const existing = context.rows.find((row) => row.stripeSubscriptionId === live.id)
      || context.rows.find((row) => row.id === live.metadata.subscriptionId && !row.stripeSubscriptionId && !claimedRowIds.has(row.id))
    if (existing) claimedRowIds.add(existing.id)
    const expectedCustomer = existing?.stripeCustomerId
    const projection = getSubscriptionProjection(live)
    if (expectedCustomer && expectedCustomer !== projection.stripeCustomerId) {
      throw new Error(`Stripe customer mismatch for subscription ${live.id}`)
    }
    return { ...projection, id: existing?.id || randomUUID(), referenceId: workspaceId }
  })
  const paidPlans = projections.filter((row) => hasPaidAccess(row.status)).map((row) => row.plan)
  const overrides = context.rows.map(overridePlan).filter((plan): plan is BillingPlan => plan !== null)
  const plan = getComplimentaryWorkspacePlan(workspaceId) || strongestPlan([...paidPlans, ...overrides])
  const guard = ownsBillingLease(lease)

  // Neon HTTP supports atomic batches. Lock the lease row first so a worker
  // whose lease expired cannot publish an older Stripe response.
  const fence = db.update(billingState).set({ lockToken: lease.token })
    .where(and(eq(billingState.workspaceId, workspaceId), guard)).returning({ id: billingState.workspaceId })
  const writes = projections.map((row) => db.insert(subscription).select(
    db.select({
      id: sql<string>`${row.id}`.as("id"), plan: sql<typeof row.plan>`${row.plan}`.as("plan"),
      referenceId: sql<string>`${workspaceId}`.as("referenceId"),
      stripeCustomerId: sql<string>`${row.stripeCustomerId}`.as("stripeCustomerId"),
      stripeSubscriptionId: sql<string>`${row.stripeSubscriptionId}`.as("stripeSubscriptionId"),
      status: sql<typeof row.status>`${row.status}`.as("status"),
      periodStart: sql<Date | null>`${row.periodStart?.toISOString() ?? null}::timestamp`.as("periodStart"),
      periodEnd: sql<Date | null>`${row.periodEnd?.toISOString() ?? null}::timestamp`.as("periodEnd"),
      cancelAtPeriodEnd: sql<boolean>`${row.cancelAtPeriodEnd}`.as("cancelAtPeriodEnd"),
      cancelAt: sql<Date | null>`${row.cancelAt?.toISOString() ?? null}::timestamp`.as("cancelAt"),
      canceledAt: sql<Date | null>`${row.canceledAt?.toISOString() ?? null}::timestamp`.as("canceledAt"),
      endedAt: sql<Date | null>`${row.endedAt?.toISOString() ?? null}::timestamp`.as("endedAt"),
      seats: sql<number>`${row.seats}`.as("seats"),
      trialStart: sql<Date | null>`${row.trialStart?.toISOString() ?? null}::timestamp`.as("trialStart"),
      trialEnd: sql<Date | null>`${row.trialEnd?.toISOString() ?? null}::timestamp`.as("trialEnd"),
      billingInterval: sql<typeof row.billingInterval>`${row.billingInterval}`.as("billingInterval"),
      stripeScheduleId: sql<string | null>`${row.stripeScheduleId}`.as("stripeScheduleId"),
      createdAt: sql<Date>`now()`.as("createdAt"), updatedAt: sql<Date>`now()`.as("updatedAt"),
    }).from(billingState).where(and(eq(billingState.workspaceId, workspaceId), guard)),
  ))
  // Existing incomplete checkout rows conflict by primary key when first linked.
  // Update those rows instead of inserting them a second time.
  const operations = projections.map((row, index) => context.rows.some((existing) => existing.id === row.id)
    ? db.update(subscription).set({ ...row, updatedAt: new Date() })
      .where(and(eq(subscription.id, row.id), eq(subscription.referenceId, workspaceId), guard))
    : writes[index]!)
  const result = await db.batch([
    fence,
    ...operations,
    db.update(workspace).set({ plan }).where(and(eq(workspace.id, workspaceId), guard)),
    db.update(billingState).set({ plan, syncedAt: sql`now()` })
      .where(and(eq(billingState.workspaceId, workspaceId), guard)),
  ])
  if (!result[0].length) throw new BillingBusyError()
  return { plan, subscriptions: projections, ...context }
}

export async function syncWorkspaceBilling(workspaceId: string) {
  return withBillingLock(workspaceId, syncBillingUnderLease)
}
