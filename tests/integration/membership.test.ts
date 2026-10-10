import { expect, test } from "bun:test"
import { neonConfig } from "@neondatabase/serverless"
import { eq } from "drizzle-orm"

const url = process.env.TEST_DATABASE_URL
const endpoint = process.env.TEST_NEON_HTTP_URL

test.skipIf(!url || !endpoint)("invitation activation reactivates members, enforces capacity under concurrency, and consumes only accepted invites", async () => {
  if (![url!, endpoint!].every(value => ["localhost", "127.0.0.1"].includes(new URL(value).hostname))) throw new Error("Disposable local services required")
  process.env.DATABASE_URL = url
  neonConfig.fetchEndpoint = () => endpoint!
  const { db, user, workspace, workspaceMember, workspaceInvite } = await import("../../packages/db")
  const { activateMembership } = await import("../../packages/api/src/team/membership")
  const id = crypto.randomUUID()
  const users = Array.from({ length: 5 }, (_, i) => ({ id: `${id}-${i}`, email: `${id}-${i}@example.invalid`, name: "QA", emailVerified: true, createdAt: new Date(), updatedAt: new Date() }))
  await db.insert(user).values(users)
  try {
    await db.insert(workspace).values({ id, name: "QA", slug: id, domain: `${id}.invalid`, ownerId: users[0]!.id, widgetSecret: "test-only" })
    await db.insert(workspaceMember).values({ workspaceId: id, userId: users[1]!.id, isActive: false, role: "admin" })
    await db.insert(workspaceInvite).values(users.slice(1).map(u => ({ workspaceId: id, email: u.email, role: "viewer" as const, invitedBy: users[0]!.id, token: u.id, expiresAt: new Date(Date.now() + 60000) })))
    const activate = (index: number) => activateMembership(db, { workspaceId: id, userId: users[index]!.id, email: users[index]!.email, role: "viewer", maxMembers: 2, inviteToken: users[index]!.id })
    expect(await activate(1)).toBe(true)
    const [rejoined] = await db.select().from(workspaceMember).where(eq(workspaceMember.userId, users[1]!.id))
    expect(rejoined!.isActive).toBe(true)
    expect(rejoined!.role).toBe("viewer")
    expect(rejoined!.permissions.canManageMembers).toBe(false)
    const competing = await Promise.all([activate(2), activate(3), activate(4)])
    expect(competing.filter(Boolean)).toHaveLength(1)
    expect(await db.select().from(workspaceMember).where(eq(workspaceMember.workspaceId, id))).toHaveLength(2)
    expect(await db.select().from(workspaceInvite).where(eq(workspaceInvite.workspaceId, id))).toHaveLength(2)
    expect(await activate(1)).toBe(false)
    await db.update(workspaceInvite).set({ expiresAt: new Date(0) }).where(eq(workspaceInvite.workspaceId, id))
    const rejected = competing.findIndex(x => !x) + 2
    expect(await activateMembership(db, { workspaceId: id, userId: users[rejected]!.id, email: users[rejected]!.email, role: "admin", maxMembers: 10, inviteToken: users[rejected]!.id })).toBe(false)
  } finally {
    await db.delete(workspace).where(eq(workspace.id, id))
    for (const u of users) await db.delete(user).where(eq(user.id, u.id))
  }
}, 15000)
