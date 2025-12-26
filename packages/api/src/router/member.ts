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
} from "@oreilla/db"
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
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(post.authorId, input.userId)))
          .limit(1)

        const [commentsCountRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(comment)
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(comment.authorId, input.userId)))
          .limit(1)

        const [postVotesCountRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(vote)
          .innerJoin(post, eq(vote.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(vote.userId, input.userId)))
          .limit(1)

        const [commentVotesCountRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(vote)
          .innerJoin(comment, eq(vote.commentId, comment.id))
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(vote.userId, input.userId)))
          .limit(1)

        const topPosts = await ctx.db
          .select({ id: post.id, title: post.title, slug: post.slug, upvotes: post.upvotes, status: post.roadmapStatus })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(post.authorId, input.userId)))
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

        const postCreated = await ctx.db
          .select({
            id: post.id,
            type: sql<string>`'post_created'`,
            title: post.title,
            entity: sql<string>`'post'`,
            entityId: post.id,
            createdAt: post.createdAt,
            status: post.roadmapStatus,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(post.authorId, input.userId), ...(cursorDate ? [lt(post.createdAt, cursorDate)] : [])))
          .limit(limit)

        const postUpdated = await ctx.db
          .select({
            id: postUpdate.id,
            type: sql<string>`'post_updated'`,
            title: postUpdate.title,
            entity: sql<string>`'post'`,
            entityId: postUpdate.postId,
            createdAt: postUpdate.createdAt,
            status: post.roadmapStatus,
          })
          .from(postUpdate)
          .innerJoin(post, eq(postUpdate.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(postUpdate.authorId, input.userId), ...(cursorDate ? [lt(postUpdate.createdAt, cursorDate)] : [])))
          .limit(limit)

        const postMerged = await ctx.db
          .select({
            id: postMerge.id,
            type: sql<string>`'post_merged'`,
            title: sql<string>`'Merged post'`,
            entity: sql<string>`'post'`,
            entityId: postMerge.targetPostId,
            createdAt: postMerge.createdAt,
            status: post.roadmapStatus,
          })
          .from(postMerge)
          .innerJoin(post, eq(postMerge.targetPostId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(postMerge.mergedBy, input.userId), ...(cursorDate ? [lt(postMerge.createdAt, cursorDate)] : [])))
          .limit(limit)

        const commentCreated = await ctx.db
          .select({
            id: comment.id,
            type: sql<string>`'comment_created'`,
            title: sql<string>`'Commented'`,
            entity: sql<string>`'post'`,
            entityId: comment.postId,
            createdAt: comment.createdAt,
            status: post.roadmapStatus,
          })
          .from(comment)
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(comment.authorId, input.userId), ...(cursorDate ? [lt(comment.createdAt, cursorDate)] : [])))
          .limit(limit)

        const commentEdited = await ctx.db
          .select({
            id: comment.id,
            type: sql<string>`'comment_edited'`,
            title: sql<string>`'Edited comment'`,
            entity: sql<string>`'post'`,
            entityId: comment.postId,
            createdAt: comment.editedAt,
            status: post.roadmapStatus,
          })
          .from(comment)
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(comment.authorId, input.userId), ...(cursorDate ? [lt(comment.editedAt as any, cursorDate)] : [])))
          .limit(limit)

        const votePosts = await ctx.db
          .select({
            id: vote.id,
            type: sql<string>`'vote_post'`,
            title: sql<string>`'Upvoted post'`,
            entity: sql<string>`'post'`,
            entityId: vote.postId,
            createdAt: vote.createdAt,
            status: post.roadmapStatus,
          })
          .from(vote)
          .innerJoin(post, eq(vote.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(vote.userId, input.userId), ...(cursorDate ? [lt(vote.createdAt, cursorDate)] : [])))
          .limit(limit)

        const voteComments = await ctx.db
          .select({
            id: vote.id,
            type: sql<string>`'vote_comment'`,
            title: sql<string>`'Upvoted comment'`,
            entity: sql<string>`'post'`,
            entityId: comment.postId,
            createdAt: vote.createdAt,
            status: post.roadmapStatus,
          })
          .from(vote)
          .innerJoin(comment, eq(vote.commentId, comment.id))
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), eq(vote.userId, input.userId), ...(cursorDate ? [lt(vote.createdAt, cursorDate)] : [])))
          .limit(limit)

        const all = [
          ...postCreated,
          ...postUpdated,
          ...postMerged,
          ...commentCreated,
          ...commentEdited.filter((e: { createdAt: Date | null }) => e.createdAt),
          ...votePosts,
          ...voteComments,
        ].sort((a, b) => {
          const at = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return bt - at
        })

        const limited = all.slice(0, limit)
        const nextCursor = limited.length > 0 ? new Date(limited[limited.length - 1].createdAt as any).toISOString() : null

        c.header("Cache-Control", "private, max-age=60, stale-while-revalidate=300")
        return c.superjson({ items: limited, nextCursor })
      }),
  })
}
