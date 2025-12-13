import { and, eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { workspace, workspaceMember } from "@oreilla/db"

export async function requireBoardManagerBySlug(ctx: any, slug: string) {
  const [ws] = await ctx.db
    .select({ id: workspace.id, ownerId: workspace.ownerId, plan: workspace.plan })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  if (!ws) {
    throw new HTTPException(404, { message: "Workspace not found" })
  }

  let allowed = ws.ownerId === ctx.session.user.id

  if (!allowed) {
    const [member] = await ctx.db
      .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
      .from(workspaceMember)
      .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
      .limit(1)
    const perms = (member?.permissions || {}) as Record<string, boolean>
    if (member?.role === "admin" || perms?.canManageBoards) {
      allowed = true
    }
  }

  if (!allowed) {
    throw new HTTPException(403, { message: "Forbidden" })
  }

  return ws
}

export async function requireBrandingManagerBySlug(ctx: any, slug: string) {
  const [ws] = await ctx.db
    .select({ id: workspace.id, ownerId: workspace.ownerId, plan: workspace.plan })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  if (!ws) {
    throw new HTTPException(404, { message: "Workspace not found" })
  }

  let allowed = ws.ownerId === ctx.session.user.id

  try {
    const [me] = await ctx.db
      .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
      .from(workspaceMember)
      .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
      .limit(1)
    const perms = (me?.permissions || {}) as Record<string, boolean>
    if (!allowed) {
      allowed = me?.role === "admin" || me?.role === "member" || perms?.canConfigureBranding === true
    }
  } catch {
    // Ignore membership lookup errors; fall back to owner-only
  }

  if (!allowed) {
    throw new HTTPException(403, { message: "Forbidden" })
  }

  return ws
}


