import { randomUUID } from "node:crypto"
import { and, eq, isNull, lte, sql } from "drizzle-orm"
import { board, db, post, user, webhookDelivery, widgetUser, workspace, workspaceIntegration } from "@featul/db"
import { getEffectiveWorkspacePlan } from "@featul/auth/billing"
import { isIntegrationsAllowed } from "../shared/plan"
import { connectWebhookSchema } from "../validators/integration"
import { sendWebhookNotification } from "./webhook"

type Dependencies = {
  send: typeof sendWebhookNotification
  plan: typeof getEffectiveWorkspacePlan
}
const dependencies: Dependencies = { send: sendWebhookNotification, plan: getEffectiveWorkspacePlan }

export async function processWebhookDelivery(database: typeof db, id: string, deps: Dependencies = dependencies) {
  const token = randomUUID()
  const [claimed] = await database.update(webhookDelivery).set({
    lockToken: token, lockedUntil: sql`now() + interval '1 minute'`,
    attempts: sql`${webhookDelivery.attempts} + 1`,
  }).where(and(eq(webhookDelivery.id, id), isNull(webhookDelivery.completedAt),
    lte(webhookDelivery.nextAttemptAt, sql`now()`),
    sql`${webhookDelivery.lockedUntil} is null or ${webhookDelivery.lockedUntil} < now()`,
  )).returning()
  if (!claimed) return "unclaimed"
  const guard = and(eq(webhookDelivery.id, id), eq(webhookDelivery.lockToken, token))
  try {
    const [target] = await database.select({
      integrationId: workspaceIntegration.id, active: workspaceIntegration.isActive,
      type: workspaceIntegration.type, url: workspaceIntegration.webhookUrl,
      workspaceId: workspace.id, workspaceActive: workspace.isActive,
      workspaceName: workspace.name, workspaceSlug: workspace.slug,
      id: post.id, title: post.title, content: post.content, slug: post.slug,
      image: post.image, status: post.roadmapStatus, createdAt: post.createdAt,
      boardName: board.name, boardSlug: board.slug,
      authorName: sql<string | null>`coalesce(${widgetUser.name}, ${user.name})`,
    }).from(webhookDelivery)
      .innerJoin(workspaceIntegration, eq(webhookDelivery.integrationId, workspaceIntegration.id))
      .innerJoin(post, eq(webhookDelivery.postId, post.id))
      .innerJoin(board, eq(post.boardId, board.id))
      .innerJoin(workspace, and(eq(board.workspaceId, workspace.id), eq(workspaceIntegration.workspaceId, workspace.id)))
      .leftJoin(user, eq(post.authorId, user.id))
      .leftJoin(widgetUser, eq(post.widgetUserId, widgetUser.id))
      .where(eq(webhookDelivery.id, id)).limit(1)
    const enabled = target?.active && target.workspaceActive && isIntegrationsAllowed(await deps.plan(target.workspaceId))
    if (target && enabled) {
      // Revalidate stored destinations too: never follow arbitrary redirects or send to a replaced host.
      connectWebhookSchema.parse({ workspaceSlug: target.workspaceSlug, type: target.type, webhookUrl: target.url })
      const response = await deps.send(target.type, target.url, {
        ...target, status: target.status ?? undefined, authorName: target.authorName ?? undefined,
      })
      if (!response.success) throw new Error("Provider delivery failed")
    }
    await database.batch([
      database.update(webhookDelivery).set({ completedAt: new Date(), lastError: null, lockedUntil: null }).where(guard),
      ...(target && enabled ? [database.update(workspaceIntegration).set({ lastTriggeredAt: new Date() })
        .where(and(eq(workspaceIntegration.id, target.integrationId), eq(workspaceIntegration.webhookUrl, target.url),
          sql`exists (select 1 from webhook_delivery where id = ${id} and lock_token = ${token} and completed_at is not null)`))] : []),
    ])
    return enabled ? "delivered" : "skipped"
  } catch {
    await database.update(webhookDelivery).set({
      lockToken: null, lockedUntil: null, lastError: "Delivery failed; queued for retry",
      nextAttemptAt: new Date(Date.now() + Math.min(3600, 30 * 2 ** Math.min(claimed.attempts, 7)) * 1000),
    }).where(guard)
    return "failed"
  }
}

/** At-least-once delivery: an ambiguous provider response may produce a duplicate on retry. */
export async function reconcileWebhooks(database: typeof db = db) {
  const deadline = Date.now() + 25_000
  const pending = await database.select({ id: webhookDelivery.id }).from(webhookDelivery)
    .where(and(isNull(webhookDelivery.completedAt), lte(webhookDelivery.nextAttemptAt, sql`now()`),
      sql`${webhookDelivery.lockedUntil} is null or ${webhookDelivery.lockedUntil} < now()`))
    .orderBy(webhookDelivery.nextAttemptAt).limit(10)
  const result = { delivered: 0, failures: 0, skipped: 0, overdue: 0 }
  for (const item of pending) {
    if (Date.now() >= deadline) break
    const status = await processWebhookDelivery(database, item.id)
    if (status === "delivered") result.delivered++
    else if (status === "failed") result.failures++
    else if (status === "skipped") result.skipped++
  }
  const [backlog] = await database.select({ count: sql<number>`count(*)::int` }).from(webhookDelivery)
    .where(and(isNull(webhookDelivery.completedAt), sql`${webhookDelivery.createdAt} < now() - interval '15 minutes'`))
  result.overdue = Number(backlog?.count ?? 0)
  return result
}
