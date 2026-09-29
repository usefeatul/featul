import { and, eq, or, sql, type SQL } from "drizzle-orm"
import { board, comment, db, post, workspace, workspaceMember } from "@featul/db"
import { HTTPException } from "hono/http-exception"
import { hasActiveWorkspaceAccess } from "../shared/access"

export const publicBoardConditions = () => and(
  eq(board.isPublic, true), eq(board.isVisible, true),
  eq(board.isActive, true), eq(board.isSystem, false),
)

export async function findSimilarVisiblePosts(database: typeof db, workspaceSlug: string, boardSlug: string, userId: string | null, search: SQL) {
  const member = userId ? or(eq(workspace.ownerId, userId), sql`exists (
    select 1 from ${workspaceMember} where ${workspaceMember.workspaceId} = ${workspace.id}
      and ${workspaceMember.userId} = ${userId} and ${workspaceMember.isActive} = true
  )`) : sql`false`
  return database.select({ id: post.id, title: post.title, slug: post.slug, upvotes: post.upvotes, commentCount: post.commentCount })
    .from(post).innerJoin(board, eq(post.boardId, board.id)).innerJoin(workspace, eq(board.workspaceId, workspace.id))
    .where(and(eq(workspace.slug, workspaceSlug), eq(workspace.isActive, true), eq(board.slug, boardSlug),
      eq(board.isActive, true), eq(board.isSystem, false), eq(post.status, "published"), search,
      or(and(eq(board.isPublic, true), eq(board.isVisible, true)), member)))
    .limit(3)
}

/** Shared authorization for mutations addressed by a public content ID. */
export async function requirePostAccess(database: typeof db, postId: string, userId: string | null) {
  const [target] = await database.select({
    id: post.id, title: post.title, roadmapStatus: post.roadmapStatus,
    status: post.status, workspaceId: workspace.id, ownerId: workspace.ownerId,
    isActive: board.isActive, isPublic: board.isPublic, isVisible: board.isVisible,
    isSystem: board.isSystem,
  }).from(post).innerJoin(board, eq(post.boardId, board.id))
    .innerJoin(workspace, eq(board.workspaceId, workspace.id))
    .where(and(eq(post.id, postId), eq(workspace.isActive, true))).limit(1)
  if (!target || target.status !== "published" || !target.isActive || target.isSystem) {
    throw new HTTPException(404, { message: "Post not found" })
  }
  const member = await hasActiveWorkspaceAccess({ db: database }, target.workspaceId, target.ownerId, userId)
  if ((!target.isPublic || !target.isVisible) && !member) {
    throw new HTTPException(404, { message: "Post not found" })
  }
  return { ...target, member }
}

export async function requireCommentAccess(database: typeof db, commentId: string, userId: string | null) {
  const [target] = await database.select({ id: comment.id, postId: comment.postId, status: comment.status, isInternal: comment.isInternal })
    .from(comment).where(eq(comment.id, commentId)).limit(1)
  if (!target || target.status !== "published") throw new HTTPException(404, { message: "Comment not found" })
  const parent = await requirePostAccess(database, target.postId, userId)
  if (target.isInternal && !parent.member) throw new HTTPException(404, { message: "Comment not found" })
  return { ...parent, commentId: target.id, postId: target.postId }
}
