import { j, privateProcedure } from "../jstack"
import { HTTPException } from "hono/http-exception"
import { and, eq, lt, sql, isNull } from "drizzle-orm"
import {
  workspace,
  workspaceMember,
  board,
  post,
  comment,
  vote,
  user,
  postUpdate,
  postMerge,
  activityLog,
} from "@featul/db"
import { memberByWorkspaceInputSchema, memberActivityInputSchema } from "../validators/member"

async function getWorkspaceBySlugOrThrow(ctx: any, slug: string) {
  const [ws] = await ctx.db
    .select({ id: workspace.id, ownerId: workspace.ownerId, slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (!ws) throw new HTTPException(404, { message: "Workspace not found" })
  return ws
}

async function requireIsMember(ctx: any, wsId: string) {
  const meId = ctx.session.user.id
  const [me] = await ctx.db
    .select({ id: workspaceMember.id })
    .from(workspaceMember)
    .where(and(eq(workspaceMember.workspaceId, wsId), eq(workspaceMember.userId, meId), eq(workspaceMember.isActive, true)))
    .limit(1)
  const allowed = Boolean(me) || (await ctx.db.select({ id: workspace.id }).from(workspace).where(and(eq(workspace.id, wsId), eq(workspace.ownerId, meId))).limit(1)).length > 0
  if (!allowed) throw new HTTPException(403, { message: "Forbidden" })
  return meId
}

export function createMemberRouter() {
  return j.router({
    statsByWorkspaceSlug: privateProcedure
      .input(memberByWorkspaceInputSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await getWorkspaceBySlugOrThrow(ctx, input.slug)
        await requireIsMember(ctx, ws.id)

        const [postsCountRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(post.authorId, input.userId)))
          .limit(1)

        const [commentsCountRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(comment)
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(comment.authorId, input.userId)))
          .limit(1)

        const [postVotesCountRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(vote)
          .innerJoin(post, eq(vote.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(vote.userId, input.userId), isNull(vote.commentId)))
          .limit(1)

        const [commentVotesCountRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(vote)
          .innerJoin(comment, eq(vote.commentId, comment.id))
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(vote.userId, input.userId), isNull(vote.postId)))
          .limit(1)

        const topPosts = await ctx.db
          .select({ id: post.id, title: post.title, slug: post.slug, upvotes: post.upvotes, status: post.roadmapStatus })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(post.authorId, input.userId)))
          .orderBy(sql`coalesce(${post.upvotes}, 0) desc`, sql`coalesce(${post.createdAt}, now()) desc`)
          .limit(5)

        c.header("Cache-Control", "private, max-age=120, stale-while-revalidate=600")
        return c.superjson({
          stats: {
            posts: Number(postsCountRow?.count || 0),
            comments: Number(commentsCountRow?.count || 0),
            upvotes: Number(postVotesCountRow?.count || 0) + Number(commentVotesCountRow?.count || 0),
          },
          topPosts,
        })
      }),

    activityByWorkspaceSlug: privateProcedure
      .input(memberActivityInputSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await getWorkspaceBySlugOrThrow(ctx, input.slug)
        await requireIsMember(ctx, ws.id)

        const limit = Math.min(Math.max(Number(input.limit || 20), 1), 50)
        const cursorDate = input.cursor ? new Date(input.cursor) : null

        const rows = await ctx.db
          .select({
            id: activityLog.id,
            type: activityLog.action,
            title: activityLog.title,
            entity: activityLog.entity,
            entityId: activityLog.entityId,
            createdAt: activityLog.createdAt,
            metadata: activityLog.metadata,
          })
          .from(activityLog)
          .where(
            and(
              eq(activityLog.workspaceId, ws.id),
              eq(activityLog.userId, input.userId),
              ...(cursorDate ? [lt(activityLog.createdAt, cursorDate)] : []),
            ),
          )
          .orderBy(sql`${activityLog.createdAt} desc`)
          .limit(limit + 1)

        const hasMore = rows.length > limit
        const limited = rows.slice(0, limit).map((row: {
          id: string
          type: string
          title: string | null
          entity: string
          entityId: string
          createdAt: Date | null
          metadata: Record<string, any> | null
        }) => ({
          ...row,
          status:
            (row.metadata as any)?.status ??
            (row.metadata as any)?.roadmapStatus ??
            null,
        }))
        const nextCursor =
          hasMore && limited.length > 0
            ? new Date(limited[limited.length - 1].createdAt as any).toISOString()
            : null

        c.header("Cache-Control", "private, max-age=60, stale-while-revalidate=300")
        return c.superjson({ items: limited, nextCursor })
      }),
  })
}
