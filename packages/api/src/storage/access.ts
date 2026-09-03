import { auth } from "@featul/auth"
import { workspace, workspaceMember } from "@featul/db"
import { and, eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { headers } from "next/headers"

export async function getSessionUserId(rawHeaders: Headers): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: rawHeaders || (await headers()) })
    return session?.user?.id || null
  } catch {
    return null
  }
}

export async function hasActiveWorkspaceMembership(ctx: any, workspaceId: string, userId: string): Promise<boolean> {
  const [member] = await ctx.db
    .select({ id: workspaceMember.id })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId),
        eq(workspaceMember.isActive, true)
      )
    )
    .limit(1)

  return Boolean(member?.id)
}

export async function hasWorkspaceContentAccess({
  ctx,
  workspaceId,
  workspaceOwnerId,
  userId,
}: {
  ctx: any
  workspaceId: string
  workspaceOwnerId: string
  userId: string | null
}): Promise<boolean> {
  if (!userId) return false
  if (workspaceOwnerId === userId) return true
  return await hasActiveWorkspaceMembership(ctx, workspaceId, userId)
}

export async function canUploadWorkspaceAsset({
  ctx,
  workspaceId,
  workspaceOwnerId,
  userId,
  folder,
}: {
  ctx: any
  workspaceId: string
  workspaceOwnerId: string
  userId: string
  folder: string
}): Promise<boolean> {
  if (workspaceOwnerId === userId) return true

  const [membership] = await ctx.db
    .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId),
        eq(workspaceMember.isActive, true)
      )
    )
    .limit(1)

  if (!membership) return false
  if (membership.role === "admin" || membership.role === "member") return true

  const perms = (membership.permissions || {}) as Record<string, boolean>
  const isBrandingUpload = folder.startsWith("branding/")
  if (isBrandingUpload && perms.canConfigureBranding === true) return true

  return false
}

/** NEXT-FILES-001: only the caller’s user prefix, or a workspace they can access, or unreferenced post/comment drafts. */
export async function assertCallerCanDeleteUploadKey({
  ctx,
  userId,
  key,
}: {
  ctx: any
  userId: string
  key: string
}): Promise<void> {
  const parts = key.split("/")
  if (parts[0] === "users") {
    if (parts[1] !== userId) {
      throw new HTTPException(403, { message: "Forbidden" })
    }
    return
  }

  if (parts[0] === "workspaces") {
    const slug = parts[1]
    const folder = parts[2]
    if (!slug || !folder) {
      throw new HTTPException(400, { message: "Invalid image URL" })
    }

    const [ws] = await ctx.db
      .select({ id: workspace.id, ownerId: workspace.ownerId })
      .from(workspace)
      .where(eq(workspace.slug, slug))
      .limit(1)
    if (!ws) {
      throw new HTTPException(400, { message: "Invalid image URL" })
    }

    const memberAccess = await hasWorkspaceContentAccess({
      ctx,
      workspaceId: ws.id,
      workspaceOwnerId: ws.ownerId,
      userId,
    })
    if (memberAccess) return
    if (folder === "posts" || folder === "comments") return
  }

  throw new HTTPException(403, { message: "Forbidden" })
}
