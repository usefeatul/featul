import { expect, test } from "bun:test"
import { neonConfig } from "@neondatabase/serverless"
import { eq, sql } from "drizzle-orm"

const url = process.env.TEST_DATABASE_URL
const endpoint = process.env.TEST_NEON_HTTP_URL

test.skipIf(!url || !endpoint)("post creation and delivery outbox roll back together; retries survive failures and competing workers", async () => {
  if (![url!, endpoint!].every(value => ["localhost", "127.0.0.1"].includes(new URL(value).hostname))) throw new Error("Requires disposable local services")
  process.env.DATABASE_URL = url
  neonConfig.fetchEndpoint = () => endpoint!
  const { db, user, workspace, board, post, vote, activityLog, workspaceIntegration, webhookDelivery } = await import("../../packages/db")
  const { createPostAtomically } = await import("../../packages/api/src/post/creation")
  const { processWebhookDelivery } = await import("../../packages/api/src/services/delivery")
  const id = crypto.randomUUID()
  await db.insert(user).values({ id, email: `${id}@example.invalid`, name: "QA", emailVerified: true, createdAt: new Date(), updatedAt: new Date() })
  try {
    await db.insert(workspace).values({ id, ownerId: id, name: "QA", slug: id, domain: `${id}.invalid`, widgetSecret: "test-only" })
    await db.insert(board).values({ id, workspaceId: id, createdBy: id, name: "QA", slug: "ideas" })
    await db.insert(workspaceIntegration).values([
      { id: `${id}-slack`, workspaceId: id, type: "slack", webhookUrl: "https://hooks.slack.com/services/TEST/TEST/TEST" },
      { id: `${id}-discord`, workspaceId: id, type: "discord", webhookUrl: "https://discord.com/api/webhooks/123/test" },
    ])
    const input = {
      workspaceId: id, values: { boardId: id, title: "Test", slug: "test", content: "Synthetic feedback" },
      voter: { userId: id },
      activity: { workspaceId: id, userId: id, action: "post_created", actionType: "create" as const, entity: "post" },
    }
    await expect(createPostAtomically(db, { ...input, voter: { userId: "missing-user" } })).rejects.toThrow()
    await expect(createPostAtomically(db, { ...input, activity: { ...input.activity, workspaceId: "missing-workspace" } })).rejects.toThrow()
    const failingOutbox = new Proxy(db, { get(target, property) {
      if (property === "execute") return () => db.execute(sql`select 1/0`)
      const value = Reflect.get(target, property)
      return typeof value === "function" ? value.bind(target) : value
    } })
    await expect(createPostAtomically(failingOutbox, input)).rejects.toThrow()
    expect(await db.select().from(post).where(eq(post.boardId, id))).toHaveLength(0)
    expect(await db.select().from(vote).where(eq(vote.userId, id))).toHaveLength(0)
    expect(await db.select().from(activityLog).where(eq(activityLog.workspaceId, id))).toHaveLength(0)
    const created = await createPostAtomically(db, input)
    expect(created.upvotes).toBe(1)
    expect(await db.select().from(vote).where(eq(vote.postId, created.id))).toHaveLength(1)
    const deliveries = await db.select().from(webhookDelivery).where(eq(webhookDelivery.postId, created.id))
    expect(deliveries).toHaveLength(2)
    const slack = deliveries.find(row => row.integrationId.endsWith("slack"))!
    const discord = deliveries.find(row => row.integrationId.endsWith("discord"))!
    const plan = async () => "starter" as const
    expect(await processWebhookDelivery(db, slack.id, { plan, send: async () => ({ success: false }) })).toBe("failed")
    const [failed] = await db.select().from(webhookDelivery).where(eq(webhookDelivery.id, slack.id))
    expect(failed!.attempts).toBe(1)
    expect(failed!.completedAt).toBeNull()
    expect(failed!.nextAttemptAt.getTime()).toBeGreaterThan(Date.now())
    expect((await db.select().from(workspaceIntegration).where(eq(workspaceIntegration.id, slack.integrationId)))[0]!.lastTriggeredAt).toBeNull()
    let sends = 0
    const send = async () => { sends++; await new Promise(resolve => setTimeout(resolve, 30)); return { success: true } }
    expect(await processWebhookDelivery(db, slack.id, { plan, send })).toBe("unclaimed")
    await db.update(webhookDelivery).set({ nextAttemptAt: new Date(0) }).where(eq(webhookDelivery.id, slack.id))
    const results = await Promise.all([processWebhookDelivery(db, slack.id, { plan, send }), processWebhookDelivery(db, slack.id, { plan, send })])
    expect(results.sort()).toEqual(["delivered", "unclaimed"])
    expect(sends).toBe(1)
    expect(await processWebhookDelivery(db, slack.id, { plan, send })).toBe("unclaimed")
    expect((await db.select().from(workspaceIntegration).where(eq(workspaceIntegration.id, slack.integrationId)))[0]!.lastTriggeredAt).not.toBeNull()
    // Recover a lease left by a terminated invocation; disabled integrations must not send.
    await db.update(webhookDelivery).set({ lockToken: "terminated", lockedUntil: new Date(Date.now() + 60000) }).where(eq(webhookDelivery.id, discord.id))
    expect(await processWebhookDelivery(db, discord.id, { plan, send })).toBe("unclaimed")
    await db.update(webhookDelivery).set({ lockedUntil: new Date(0) }).where(eq(webhookDelivery.id, discord.id))
    await db.update(workspaceIntegration).set({ isActive: false }).where(eq(workspaceIntegration.id, discord.integrationId))
    expect(await processWebhookDelivery(db, discord.id, { plan, send })).toBe("skipped")
    expect(sends).toBe(1)
  } finally {
    await db.delete(workspace).where(eq(workspace.id, id))
    await db.delete(user).where(eq(user.id, id))
  }
}, 20000)
