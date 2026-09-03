import { and, eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { workspace, workspaceMember } from "@featul/db"
import { getEffectiveWorkspacePlan } from "@featul/auth/billing"
import { mapPermissions } from "./permissions"

type WorkspaceRow = {
  id: string
  ownerId: string
  plan: string
  slug: string
}

function activeMemberFilter(workspaceId: string, userId: string) {
  return and(
    eq(workspaceMember.workspaceId, workspaceId),
    eq(workspaceMember.userId, userId),
    eq(workspaceMember.isActive, true),
  )
}

export async function getActiveWorkspaceMembership(
  ctx: { db: any },
  workspaceId: string,
  userId: string,
) {
  const [member] = await ctx.db
    .select({
      role: workspaceMember.role,
      permissions: workspaceMember.permissions,
    })
    .from(workspaceMember)
    .where(activeMemberFilter(workspaceId, userId))
    .limit(1)

  return member ?? null
}

/** Owner or active member. NEXT-AUTH-001: inactive rows must not retain access. */
export async function hasActiveWorkspaceAccess(
  ctx: { db: any },
  workspaceId: string,
  ownerId: string,
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false
  if (ownerId === userId) return true
  const member = await getActiveWorkspaceMembership(ctx, workspaceId, userId)
  return Boolean(member)
}

/** Owner, admin, or member with moderate permission. Viewers cannot change status/board/tags. */
export async function canModerateWorkspace(
  ctx: { db: any },
  workspaceId: string,
  ownerId: string,
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false
  if (ownerId === userId) return true
  const member = await getActiveWorkspaceMembership(ctx, workspaceId, userId)
  if (!member) return false
  return mapPermissions(member.role).canModerateAllBoards
}

export async function canManageWorkspaceSettings(
  ctx: { db: any },
  workspaceId: string,
  ownerId: string,
  userId: string,
): Promise<boolean> {
  if (ownerId === userId) return true
  const member = await getActiveWorkspaceMembership(ctx, workspaceId, userId)
  if (!member) return false
  if (member.role === "admin") return true
  const perms = (member.permissions || {}) as Record<string, boolean>
  return perms.canManageWorkspace === true
}

export async function requireActiveWorkspaceMemberBySlug(ctx: any, slug: string) {
  const [ws] = await ctx.db
    .select({
      id: workspace.id,
      ownerId: workspace.ownerId,
      plan: workspace.plan,
      slug: workspace.slug,
      domain: workspace.domain,
    })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  if (!ws) {
    throw new HTTPException(404, { message: "Workspace not found" })
  }

  const allowed = await hasActiveWorkspaceAccess(
    ctx,
    ws.id,
    ws.ownerId,
    ctx.session?.user?.id,
  )
  if (!allowed) {
    throw new HTTPException(403, { message: "Forbidden" })
  }

  return ws
}

async function loadWorkspaceBySlug(ctx: any, slug: string): Promise<WorkspaceRow> {
  const [ws] = await ctx.db
    .select({
      id: workspace.id,
      ownerId: workspace.ownerId,
      plan: workspace.plan,
      slug: workspace.slug,
    })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)

  if (!ws) {
    throw new HTTPException(404, { message: "Workspace not found" })
  }

  return ws
}

export async function requireWorkspaceManagerBySlug(ctx: any, slug: string) {
  const ws = await loadWorkspaceBySlug(ctx, slug)
  const allowed = await canManageWorkspaceSettings(
    ctx,
    ws.id,
    ws.ownerId,
    ctx.session.user.id,
  )
  if (!allowed) {
    throw new HTTPException(403, { message: "Forbidden" })
  }
  return ws
}

export async function requireBoardManagerBySlug(ctx: any, slug: string) {
  const ws = await loadWorkspaceBySlug(ctx, slug)
  let allowed = ws.ownerId === ctx.session.user.id

  if (!allowed) {
    const member = await getActiveWorkspaceMembership(ctx, ws.id, ctx.session.user.id)
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
  const ws = await loadWorkspaceBySlug(ctx, slug)
  let allowed = ws.ownerId === ctx.session.user.id

  try {
    const me = await getActiveWorkspaceMembership(ctx, ws.id, ctx.session.user.id)
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

export async function getWorkspaceAccessPlan(workspaceId: string) {
  return getEffectiveWorkspacePlan(workspaceId)
}
