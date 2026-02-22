import { auth } from "@featul/auth"
import { workspaceMember } from "@featul/db"
import { and, eq } from "drizzle-orm"
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
