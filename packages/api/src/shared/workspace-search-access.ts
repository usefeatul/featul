import { getSessionUserId, hasWorkspaceContentAccess } from "./storage-access"

type WorkspaceRef = { id: string; ownerId: string }

type RequestContext = {
  req?: { raw?: Request }
  request?: Request
}

export async function getOptionalRequestUserId(
  c: RequestContext,
): Promise<string | null> {
  const req = c?.req?.raw || c?.request
  if (!req?.headers) return null
  return getSessionUserId(req.headers)
}

export async function canIncludePrivateBoardPosts(
  ctx: { db: unknown },
  ws: WorkspaceRef,
  userId: string | null,
): Promise<boolean> {
  if (!userId) return false
  return hasWorkspaceContentAccess({
    ctx,
    workspaceId: ws.id,
    workspaceOwnerId: ws.ownerId,
    userId,
  })
}

export async function resolveIncludePrivateBoardPosts(
  ctx: { db: unknown },
  c: RequestContext,
  ws: WorkspaceRef,
): Promise<boolean> {
  const userId = await getOptionalRequestUserId(c)
  return canIncludePrivateBoardPosts(ctx, ws, userId)
}
