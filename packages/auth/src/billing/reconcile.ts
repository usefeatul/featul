import { and, eq, isNull, sql } from "drizzle-orm"
import { billingEvent, billingState, db, workspace } from "@featul/db"
import { processBillingEvent } from "./events"
import { syncWorkspaceBilling } from "./sync"

export async function reconcileBilling() {
  const deadline = Date.now() + 40_000
  const result = { events: 0, workspaces: 0, failures: 0 }
  const events = await db.select({ id: billingEvent.id }).from(billingEvent)
    .where(and(isNull(billingEvent.completedAt), sql`${billingEvent.nextAttemptAt} <= now()`,
      sql`${billingEvent.lockedUntil} is null or ${billingEvent.lockedUntil} < now()`))
    .orderBy(billingEvent.nextAttemptAt).limit(20)
  for (const event of events) {
    if (Date.now() >= deadline) break
    try {
      await processBillingEvent(event.id)
      result.events++
    } catch (error) {
      result.failures++
      console.error("[billing] Event retry failed", { eventId: event.id, error })
    }
  }
  const workspaces = await db.select({ id: workspace.id }).from(workspace)
    .leftJoin(billingState, eq(billingState.workspaceId, workspace.id))
    .where(and(sql`${billingState.syncedAt} is null or ${billingState.syncedAt} < now() - interval '5 minutes'`,
      sql`${billingState.attemptedAt} is null or ${billingState.attemptedAt} < now() - interval '5 minutes'`,
      sql`${billingState.lockedUntil} is null or ${billingState.lockedUntil} < now()`))
    .orderBy(sql`${billingState.attemptedAt} asc nulls first`, workspace.id).limit(20)
  for (const workspace of workspaces) {
    if (Date.now() >= deadline) break
    try {
      await syncWorkspaceBilling(workspace.id)
      result.workspaces++
    } catch (error) {
      result.failures++
      console.error("[billing] Reconciliation failed", { workspaceId: workspace.id, error })
    }
  }
  const [backlog] = await db.select({ count: sql<number>`count(*)::int` }).from(billingEvent)
    .where(and(isNull(billingEvent.completedAt), sql`${billingEvent.createdAt} < now() - interval '15 minutes'`))
  return { ...result, overdueEvents: Number(backlog?.count || 0) }
}
