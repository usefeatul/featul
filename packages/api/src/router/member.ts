import { j, privateProcedure } from "../jstack"
import { HTTPException } from "hono/http-exception"
import { and, eq, sql, isNull } from "drizzle-orm"
import { loadMemberActivityPage } from "../services/member-activity"
import {
  workspace,
  workspaceMember,
  board,
  post,
  comment,
  vote,
} from "@featul/db"
import { memberByWorkspaceInputSchema, memberActivityInputSchema } from "../validators/member"
import type { AuthenticatedRouterContext as MemberRouterContext } from "../types/router"

async function getWorkspaceBySlugOrThrow(ctx: MemberRouterContext, slug: string) {
  const [ws] = await ctx.db
    .select({ id: workspace.id, ownerId: workspace.ownerId, slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1)
  if (!ws) throw new HTTPException(404, { message: "Workspace not found" })
  return ws
}

async function requireIsMember(ctx: MemberRouterContext, wsId: string) {
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

        const activityPage = await loadMemberActivityPage({
          database: ctx.db,
          workspaceId: ws.id,
          memberUserId: input.userId,
          cursor: input.cursor ?? undefined,
          limit: input.limit,
          categoryFilter: input.categoryFilter,
          statusFilter: input.statusFilter,
        })

        c.header("Cache-Control", "private, max-age=60, stale-while-revalidate=300")
        return c.superjson(activityPage)
      }),
  })
}
