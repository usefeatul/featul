import { eq, and, sql } from "drizzle-orm"
import { z } from "zod"
import { j, publicProcedure, privateProcedure } from "../jstack"
import { workspace, board, post, postTag, tag, comment, user, workspaceMember } from "@feedgot/db"
import { byIdSchema, updatePostMetaSchema, updatePostBoardSchema } from "../validators/post"
import { HTTPException } from "hono/http-exception"
import { byBoardInputSchema } from "../validators/board"
import { checkSlugInputSchema } from "../validators/workspace"



export function createBoardRouter() {
  return j.router({
    byWorkspaceSlug: publicProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ boards: [] })

        const boardsList = await ctx.db
          .select({
            id: board.id,
            name: board.name,
            slug: board.slug,
            isPublic: board.isPublic,
            allowAnonymous: board.allowAnonymous,
            allowVoting: board.allowVoting,
            allowComments: board.allowComments,
            roadmapStatuses: board.roadmapStatuses,
          })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.isPublic, true)))

        const withCounts = await Promise.all(
          boardsList.map(async (b: typeof board.$inferSelect) => {
            const [row] = await ctx.db
              .select({ count: sql<number>`count(*)` })
              .from(post)
              .where(eq(post.boardId, b.id))
              .limit(1)
            return { ...b, postCount: Number(row?.count || 0) }
          })
        )

        return c.superjson({ boards: withCounts })
      }),

    searchPostsByWorkspaceSlug: publicProcedure
      .input(z.object({ slug: checkSlugInputSchema.shape.slug, q: z.string().min(2).max(128) }))
      .get(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ posts: [] })

        const q = input.q.trim()
        const wildcard = `%${q}%`

        const rows = await ctx.db
          .select({
            id: post.id,
            title: post.title,
            slug: post.slug,
            createdAt: post.createdAt,
            upvotes: post.upvotes,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false), sql`(${post.title} ilike ${wildcard} or ${post.content} ilike ${wildcard})`))
          .orderBy(sql`least(100, ${post.upvotes}) desc`, sql`${post.createdAt} desc`)
          .limit(20)

        c.header("Cache-Control", "public, max-age=5, stale-while-revalidate=60")
        return c.superjson({ posts: rows })
      }),

    postsByBoard: publicProcedure
      .input(byBoardInputSchema)
      .get(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ posts: [] })

        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.slug, input.boardSlug)))
          .limit(1)
        if (!b) return c.superjson({ posts: [] })

        const postsList = await ctx.db
          .select({
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            image: post.image,
            authorImage: post.authorImage,
            commentCount: post.commentCount,
            upvotes: post.upvotes,
            roadmapStatus: post.roadmapStatus,
            publishedAt: post.publishedAt,
          })
          .from(post)
          .where(eq(post.boardId, b.id))

        return c.superjson({ posts: postsList })
      }),

    postDetail: publicProcedure
      .input(byIdSchema)
      .get(async ({ ctx, input, c }: any) => {
        const [p] = await ctx.db
          .select({
            id: post.id,
            title: post.title,
            content: post.content,
            slug: post.slug,
            boardId: post.boardId,
            image: post.image,
            upvotes: post.upvotes,
            commentCount: post.commentCount,
            isPinned: post.isPinned,
            isLocked: post.isLocked,
            isFeatured: post.isFeatured,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            authorId: post.authorId,
            authorName: post.authorName,
            authorEmail: post.authorEmail,
            authorImage: post.authorImage,
            isAnonymous: post.isAnonymous,
            status: post.status,
            roadmapStatus: post.roadmapStatus,
            metadata: post.metadata,
            metaTitle: post.metaTitle,
            metaDescription: post.metaDescription,
            moderatedBy: post.moderatedBy,
            moderatedAt: post.moderatedAt,
            moderationReason: post.moderationReason,
            duplicateOfId: post.duplicateOfId,
          })
          .from(post)
          .where(eq(post.id, input.postId))
          .limit(1)
        if (!p) return c.superjson({ post: null })

        const [b] = await ctx.db
          .select({
            id: board.id,
            name: board.name,
            slug: board.slug,
            isPublic: board.isPublic,
            allowAnonymous: board.allowAnonymous,
            allowVoting: board.allowVoting,
            allowComments: board.allowComments,
            roadmapStatuses: board.roadmapStatuses,
          })
          .from(board)
          .where(eq(board.id, p.boardId))
          .limit(1)

        const tagsList = await ctx.db
          .select({ id: tag.id, name: tag.name, slug: tag.slug, color: tag.color })
          .from(postTag)
          .innerJoin(tag, eq(postTag.tagId, tag.id))
          .where(eq(postTag.postId, p.id))

        const commentsList = await ctx.db
          .select({
            id: comment.id,
            content: comment.content,
            authorId: comment.authorId,
            authorName: comment.authorName,
            authorEmail: comment.authorEmail,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            editedAt: comment.editedAt,
            upvotes: comment.upvotes,
            status: comment.status,
            replyCount: comment.replyCount,
            depth: comment.depth,
            isPinned: comment.isPinned,
            isEdited: comment.isEdited,
            parentId: comment.parentId,
            metadata: comment.metadata,
          })
          .from(comment)
          .where(eq(comment.postId, p.id))

        let author: { id?: string; name?: string; image?: string } | null = null
        if (p.authorId) {
          const [au] = await ctx.db
            .select({ id: user.id, name: user.name, image: user.image })
            .from(user)
            .where(eq(user.id, p.authorId))
            .limit(1)
          author = au || null
        }

        return c.superjson({ post: p, board: b || null, tags: tagsList, comments: commentsList, author })
      }),

    tagsByWorkspaceSlug: publicProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ tags: [] })

        const rows = await ctx.db
          .select({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
            count: sql<number>`count(${board.id})`,
          })
          .from(tag)
          .leftJoin(postTag, eq(postTag.tagId, tag.id))
          .leftJoin(post, eq(postTag.postId, post.id))
          .leftJoin(board, and(eq(post.boardId, board.id), eq(board.workspaceId, ws.id), eq(board.isSystem, false)))
          .where(eq(tag.workspaceId, ws.id))
          .groupBy(tag.id, tag.name, tag.slug, tag.color)

        return c.superjson({ tags: rows })
      }),

    updatePostMeta: privateProcedure
      .input(updatePostMetaSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [p] = await ctx.db
          .select({ id: post.id, boardId: post.boardId })
          .from(post)
          .where(eq(post.id, input.postId))
          .limit(1)
        if (!p) throw new HTTPException(404, { message: "Post not found" })

        const [b] = await ctx.db
          .select({ id: board.id, workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, p.boardId))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Board not found" })

        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.id, b.workspaceId))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [member] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (member?.permissions || {}) as any
          if (member?.role === "admin" || perms?.canManageBoards || perms?.canModerateAllBoards) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const patch: any = {}
        if (input.roadmapStatus !== undefined) patch.roadmapStatus = input.roadmapStatus
        if (input.isPinned !== undefined) patch.isPinned = input.isPinned
        if (input.isLocked !== undefined) patch.isLocked = input.isLocked
        if (input.isFeatured !== undefined) patch.isFeatured = input.isFeatured
        if (Object.keys(patch).length === 0) return c.superjson({ ok: true })
        patch.updatedAt = new Date()

        await ctx.db.update(post).set(patch).where(eq(post.id, input.postId))
        return c.superjson({ ok: true })
      }),

    updatePostBoard: privateProcedure
      .input(updatePostBoardSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [p] = await ctx.db
          .select({ id: post.id, boardId: post.boardId })
          .from(post)
          .where(eq(post.id, input.postId))
          .limit(1)
        if (!p) throw new HTTPException(404, { message: "Post not found" })

        const [currentBoard] = await ctx.db
          .select({ id: board.id, workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, p.boardId))
          .limit(1)
        if (!currentBoard) throw new HTTPException(404, { message: "Board not found" })

        const [targetBoard] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, currentBoard.workspaceId), eq(board.slug, input.boardSlug)))
          .limit(1)
        if (!targetBoard) throw new HTTPException(404, { message: "Target board not found" })

        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.id, currentBoard.workspaceId))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [member] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (member?.permissions || {}) as any
          if (member?.role === "admin" || perms?.canManageBoards || perms?.canModerateAllBoards) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        await ctx.db.update(post).set({ boardId: targetBoard.id, updatedAt: new Date() }).where(eq(post.id, input.postId))
        return c.superjson({ ok: true })
      }),
  })
}
