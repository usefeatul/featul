// biome-ignore assist/source/organizeImports: <>
import { eq, and, sql, inArray, asc, type SQLWrapper } from "drizzle-orm"
import { z } from "zod"
import { j, publicProcedure, privateProcedure } from "../jstack"
import { workspace, board, post, postTag, tag, comment, user, workspaceMember, vote, activityLog } from "@oreilla/db"
import { byIdSchema, updatePostMetaSchema, updatePostBoardSchema } from "../validators/post"
import { HTTPException } from "hono/http-exception"
import { byBoardInputSchema, boardSlugSchema } from "../validators/board"
import { checkSlugInputSchema } from "../validators/workspace"
import { normalizePlan, getPlanLimits, assertWithinLimit } from "../shared/plan"
import { toSlug } from "../shared/slug"
import { requireBoardManagerBySlug } from "../shared/access"
import { createHash } from "crypto"

export function createBoardRouter() {
  return j.router({
    settingsByWorkspaceSlug: privateProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ boards: [] })

        const rows = await ctx.db
          .select({
            id: board.id,
            name: board.name,
            slug: board.slug,
            isPublic: board.isPublic,
            isVisible: board.isVisible,
            isActive: board.isActive,
            allowAnonymous: board.allowAnonymous,
            allowComments: board.allowComments,
            hidePublicMemberIdentity: board.hidePublicMemberIdentity,
            sortOrder: board.sortOrder,
          })
          .from(board)
          .where(eq(board.workspaceId, ws.id))
          .orderBy(asc(board.sortOrder), asc(board.createdAt))

        const withCounts = await Promise.all(
          rows.map(async (b: any) => {
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

    updateSettings: privateProcedure
      .input(
        z.object({
          slug: checkSlugInputSchema.shape.slug,
          boardSlug: z.string().min(1).max(64),
          patch: z.object({
            isPublic: z.boolean().optional(),
            isVisible: z.boolean().optional(),
            isActive: z.boolean().optional(),
            allowAnonymous: z.boolean().optional(),
            allowComments: z.boolean().optional(),
            hidePublicMemberIdentity: z.boolean().optional(),
            sortOrder: z.number().int().optional(),
          }),
        })
      )
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.slug, input.boardSlug)))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Board not found" })

        const next: Partial<typeof board.$inferSelect> = {}
        const p = input.patch || {}
        if (p.isPublic !== undefined) next.isPublic = p.isPublic
        if (p.isVisible !== undefined) next.isVisible = p.isVisible
        if (p.isActive !== undefined) next.isActive = p.isActive
        if (p.allowAnonymous !== undefined) next.allowAnonymous = p.allowAnonymous
        if (p.allowComments !== undefined) next.allowComments = p.allowComments
        if (p.hidePublicMemberIdentity !== undefined) next.hidePublicMemberIdentity = p.hidePublicMemberIdentity
        if (p.sortOrder !== undefined) next.sortOrder = p.sortOrder
        if (Object.keys(next).length === 0) return c.superjson({ ok: true })
        next.updatedAt = new Date()

        await ctx.db.update(board).set(next).where(eq(board.id, b.id))
        return c.superjson({ ok: true })
      }),

    updateGlobalSettings: privateProcedure
      .input(
        z.object({
          slug: checkSlugInputSchema.shape.slug,
          patch: z.object({
            allowAnonymous: z.boolean().optional(),
            allowComments: z.boolean().optional(),
            hidePublicMemberIdentity: z.boolean().optional(),
          }),
        })
      )
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const next: Partial<typeof board.$inferSelect> = {}
        const p = input.patch || {}
        if (p.allowAnonymous !== undefined) next.allowAnonymous = p.allowAnonymous
        if (p.allowComments !== undefined) next.allowComments = p.allowComments
        if (p.hidePublicMemberIdentity !== undefined) next.hidePublicMemberIdentity = p.hidePublicMemberIdentity
        if (Object.keys(next).length === 0) return c.superjson({ ok: true })
        next.updatedAt = new Date()

        await ctx.db
          .update(board)
          .set(next)
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false)))
        return c.superjson({ ok: true })
      }),

    create: privateProcedure
      .input(
        z.object({
          slug: checkSlugInputSchema.shape.slug,
          name: z.string().min(1).max(64),
          boardSlug: boardSlugSchema.optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const limits = getPlanLimits(normalizePlan(String(ws.plan || "free")))
        const [countRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false)))
          .limit(1)
        const current = Number(countRow?.count || 0)
        const maxBoards = limits.maxNonSystemBoards
        assertWithinLimit(current, maxBoards, (max) => `Boards limit reached (${max})`)

        const desiredSlug = input.boardSlug ? toSlug(input.boardSlug) : toSlug(input.name)

        const [existing] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.slug, desiredSlug)))
          .limit(1)
        if (existing) throw new HTTPException(409, { message: "Board slug already exists" })

        const [lastOrderRow] = await ctx.db
          .select({ order: sql<number>`coalesce(max(${board.sortOrder}), 0)` })
          .from(board)
          .where(eq(board.workspaceId, ws.id))
          .limit(1)
        const nextOrder = Number(lastOrderRow?.order || 0) + 1

        const [created] = await ctx.db
          .insert(board)
          .values({
            workspaceId: ws.id,
            name: input.name.trim(),
            slug: desiredSlug,
            sortOrder: nextOrder,
            createdBy: ctx.session.user.id,
            isSystem: false,
            isPublic: input.isPublic ?? true,
            isVisible: true,
          })
          .returning({ id: board.id, name: board.name, slug: board.slug, isPublic: board.isPublic })

        return c.superjson({ ok: true, board: created })
      }),

    delete: privateProcedure
      .input(z.object({ slug: checkSlugInputSchema.shape.slug, boardSlug: z.string().min(1).max(64) }))
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug)

        const [b] = await ctx.db
          .select({ id: board.id, isSystem: board.isSystem, slug: board.slug, systemType: board.systemType })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.slug, input.boardSlug)))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Board not found" })
        if (b.isSystem || b.slug === "roadmap" || b.slug === "changelog" || (b as any).systemType != null) {
          throw new HTTPException(403, { message: "Cannot delete system board" })
        }

        await ctx.db.delete(board).where(eq(board.id, b.id))
        return c.superjson({ ok: true })
      }),

    tagsCreate: privateProcedure
      .input(
        z.object({
          slug: checkSlugInputSchema.shape.slug,
          name: z.string().min(1).max(64),
          color: z.string().optional(),
        })
      )
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, plan: workspace.plan, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [member] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (member?.permissions || {}) as Record<string, boolean>
          if (member?.role === "admin" || perms?.canManageBoards) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const limits = getPlanLimits(normalizePlan(String(ws.plan || "free")))
        const [countRow] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(tag)
          .where(eq(tag.workspaceId, ws.id))
          .limit(1)
        const current = Number(countRow?.count || 0)
        const maxTags = limits.maxTags
        assertWithinLimit(current, maxTags, (max) => `Tags limit reached (${max})`)

        const slugVal = toSlug(input.name)
        const [existing] = await ctx.db
          .select({ id: tag.id })
          .from(tag)
          .where(and(eq(tag.workspaceId, ws.id), eq(tag.slug, slugVal)))
          .limit(1)
        if (existing) throw new HTTPException(409, { message: "Tag slug already exists" })

        const [created] = await ctx.db
          .insert(tag)
          .values({ workspaceId: ws.id, name: input.name.trim(), slug: slugVal, color: input.color || undefined })
          .returning({ id: tag.id })

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "tag_created",
          actionType: "create",
          entity: "tag",
          entityId: String(created.id),
          title: input.name.trim(),
          metadata: {
            slug: slugVal,
            color: input.color || null,
          },
        })

        return c.superjson({ ok: true })
      }),

    tagsDelete: privateProcedure
      .input(z.object({ slug: checkSlugInputSchema.shape.slug, tagSlug: z.string().min(1).max(64) }))
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [member] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (member?.permissions || {}) as Record<string, boolean>
          if (member?.role === "admin" || perms?.canManageBoards) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const [t] = await ctx.db
          .select({ id: tag.id })
          .from(tag)
          .where(and(eq(tag.workspaceId, ws.id), eq(tag.slug, input.tagSlug)))
          .limit(1)
        if (!t) throw new HTTPException(404, { message: "Tag not found" })

        await ctx.db.delete(tag).where(eq(tag.id, t.id))

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "tag_deleted",
          actionType: "delete",
          entity: "tag",
          entityId: String(t.id),
          title: null,
          metadata: {
            slug: input.tagSlug,
          },
        })
        return c.superjson({ ok: true })
      }),
    byWorkspaceSlug: publicProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }) => {
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
            allowComments: board.allowComments,
            roadmapStatuses: board.roadmapStatuses,
          })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.isPublic, true)))
          .orderBy(asc(board.sortOrder), asc(board.createdAt))

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

        c.header("Cache-Control", "public, max-age=30, stale-while-revalidate=300")
        return c.superjson({ boards: withCounts })
      }),

    searchPostsByWorkspaceSlug: publicProcedure
      .input(z.object({ slug: checkSlugInputSchema.shape.slug, q: z.string().min(2).max(128) }))
      .get(async ({ ctx, input, c }) => {
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
          .limit(15)

        c.header("Cache-Control", "public, max-age=5, stale-while-revalidate=60")
        return c.superjson({ posts: rows })
      }),

    postsByBoard: privateProcedure
      .input(byBoardInputSchema)
      .get(async ({ ctx, input, c }) => {
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

        const userId = ctx.session?.user?.id

        let postsList
        if (userId) {
          postsList = await ctx.db
            .select({
              id: post.id,
              title: post.title,
              slug: post.slug,
              content: post.content,
              image: post.image,
              authorImage: user.image,
              authorName: user.name,
              authorId: post.authorId,
              commentCount: post.commentCount,
              upvotes: post.upvotes,
              roadmapStatus: post.roadmapStatus,
              publishedAt: post.publishedAt,
              hasVoted: sql<boolean>`CASE WHEN ${vote.id} IS NOT NULL THEN true ELSE false END`,
              memberRole: workspaceMember.role,
              workspaceOwnerId: workspace.ownerId,
              metadata: post.metadata,
            })
            .from(post)
            .leftJoin(vote, and(eq(vote.postId, post.id), eq(vote.userId, userId)))
            .leftJoin(board, eq(post.boardId, board.id))
            .leftJoin(workspace, eq(board.workspaceId, workspace.id))
            .leftJoin(user, eq(post.authorId, user.id))
            .leftJoin(workspaceMember, and(
              eq(workspaceMember.workspaceId, workspace.id),
              eq(workspaceMember.userId, post.authorId),
              eq(workspaceMember.isActive, true)
            ))
            .where(eq(post.boardId, b.id))
        } else {
          postsList = await ctx.db
            .select({
              id: post.id,
              title: post.title,
              slug: post.slug,
              content: post.content,
              image: post.image,
              authorImage: user.image,
              authorName: user.name,
              authorId: post.authorId,
              commentCount: post.commentCount,
              upvotes: post.upvotes,
              roadmapStatus: post.roadmapStatus,
              publishedAt: post.publishedAt,
              hasVoted: sql<boolean>`false`,
              memberRole: workspaceMember.role,
              workspaceOwnerId: workspace.ownerId,
              metadata: post.metadata,
            })
            .from(post)
            .leftJoin(board, eq(post.boardId, board.id))
            .leftJoin(workspace, eq(board.workspaceId, workspace.id))
            .leftJoin(user, eq(post.authorId, user.id))
            .leftJoin(workspaceMember, and(
              eq(workspaceMember.workspaceId, workspace.id),
              eq(workspaceMember.userId, post.authorId),
              eq(workspaceMember.isActive, true)
            ))
            .where(eq(post.boardId, b.id))
        }

        const toAvatar = (seed?: string | null) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent((seed || 'anonymous').trim() || 'anonymous')}`
        const withAvatars = postsList.map((p: any) => {
          const isOwner = p.workspaceOwnerId === p.authorId
          
          let avatarSeed = p.authorImage ? null : (p.id || p.slug)
          if (!p.authorImage && p.metadata?.fingerprint) {
            avatarSeed = createHash("sha256").update(p.metadata.fingerprint).digest("hex")
          }

          return {
            ...p,
            authorImage: p.authorImage || toAvatar(avatarSeed),
            role: isOwner ? null : (p.memberRole || null),
            isOwner: Boolean(isOwner),
          }
        })
        return c.superjson({ posts: withAvatars })
      }),

    postDetail: privateProcedure
      .input(byIdSchema)
      .get(async ({ ctx, input, c }) => {
        const userId = ctx.session?.user?.id
        let p: any
        
        if (userId) {
            const [res] = await ctx.db
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
                authorName: user.name,
                authorEmail: user.email,
                authorImage: user.image,
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
                hasVoted: sql<boolean>`CASE WHEN ${vote.id} IS NOT NULL THEN true ELSE false END`,
                memberRole: workspaceMember.role,
                workspaceOwnerId: workspace.ownerId,
            })
            .from(post)
            .leftJoin(vote, and(eq(vote.postId, post.id), eq(vote.userId, userId)))
            .leftJoin(board, eq(post.boardId, board.id))
            .leftJoin(workspace, eq(board.workspaceId, workspace.id))
            .leftJoin(user, eq(post.authorId, user.id))
            .leftJoin(workspaceMember, and(
              eq(workspaceMember.workspaceId, workspace.id),
              eq(workspaceMember.userId, post.authorId),
              eq(workspaceMember.isActive, true)
            ))
            .where(eq(post.id, input.postId))
            .limit(1)
            p = res
        } else {
            const [res] = await ctx.db
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
                authorName: user.name,
                authorEmail: user.email,
                authorImage: user.image,
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
                hasVoted: sql<boolean>`false`,
                memberRole: workspaceMember.role,
                workspaceOwnerId: workspace.ownerId,
            })
            .from(post)
            .leftJoin(board, eq(post.boardId, board.id))
            .leftJoin(workspace, eq(board.workspaceId, workspace.id))
            .leftJoin(user, eq(post.authorId, user.id))
            .leftJoin(workspaceMember, and(
              eq(workspaceMember.workspaceId, workspace.id),
              eq(workspaceMember.userId, post.authorId),
              eq(workspaceMember.isActive, true)
            ))
            .where(eq(post.id, input.postId))
            .limit(1)
            p = res
        }

        if (!p) return c.superjson({ post: null })

        // Format role and isOwner
        const isOwner = p.workspaceOwnerId === p.authorId
        const formattedPost = {
          ...p,
          role: isOwner ? null : (p.memberRole || null),
          isOwner: Boolean(isOwner),
        }

        const [b] = await ctx.db
          .select({
            id: board.id,
            name: board.name,
            slug: board.slug,
            isPublic: board.isPublic,
            allowAnonymous: board.allowAnonymous,
            allowComments: board.allowComments,
            roadmapStatuses: board.roadmapStatuses,
          })
          .from(board)
          .where(eq(board.id, formattedPost.boardId))
          .limit(1)

        const tagsList = await ctx.db
          .select({ id: tag.id, name: tag.name, slug: tag.slug, color: tag.color })
          .from(postTag)
          .innerJoin(tag, eq(postTag.tagId, tag.id))
          .where(eq(postTag.postId, formattedPost.id))

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
          .where(eq(comment.postId, formattedPost.id))

        let author: { id?: string; name?: string; image?: string } | null = null
        if (formattedPost.authorId) {
          const [au] = await ctx.db
            .select({ id: user.id, name: user.name, image: user.image })
            .from(user)
            .where(eq(user.id, formattedPost.authorId))
            .limit(1)
          author = au || null
        }

        const toAvatar = (seed?: string | null) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent((seed || 'anonymous').trim() || 'anonymous')}`
        
        let avatarSeed = formattedPost.authorImage ? null : (formattedPost.id || formattedPost.slug)
        if (!formattedPost.authorImage && formattedPost.metadata?.fingerprint) {
            avatarSeed = createHash("sha256").update(formattedPost.metadata.fingerprint).digest("hex")
        }

        const postWithAvatar = { ...formattedPost, authorImage: formattedPost.authorImage || toAvatar(avatarSeed) }
        return c.superjson({ post: postWithAvatar, board: b || null, tags: tagsList, comments: commentsList, author })
      }),

    tagsByWorkspaceSlug: publicProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }) => {
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

    postCountByWorkspaceSlug: publicProcedure
      .input(
        z.object({
          slug: checkSlugInputSchema.shape.slug,
          statuses: z.array(z.string()).optional(),
          boardSlugs: z.array(z.string()).optional(),
          tagSlugs: z.array(z.string()).optional(),
          search: z.string().optional(),
        })
      )
      .get(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ count: 0 })

        const statuses = Array.isArray(input.statuses) ? input.statuses : []
        const normalizedStatuses = statuses.map((s: string) => String(s).trim().toLowerCase()).filter(Boolean)
        const boardSlugs = (input.search ? [] : (input.boardSlugs || []).map((b: string) => String(b).trim().toLowerCase()).filter(Boolean))
        const tagSlugs = (input.tagSlugs || []).map((t: string) => String(t).trim().toLowerCase()).filter(Boolean)

        const filters: SQLWrapper[] = [eq(board.workspaceId, ws.id), eq(board.isSystem, false)]
        if (normalizedStatuses.length > 0) filters.push(inArray(post.roadmapStatus, normalizedStatuses))
        if (boardSlugs.length > 0) filters.push(inArray(board.slug, boardSlugs))
        if ((input.search || '').trim()) {
          const q = `%${String(input.search).trim()}%`
          filters.push(sql`(${post.title} ilike ${q} or ${post.content} ilike ${q})`)
        }

        let row: { count: number } | undefined
        if (tagSlugs.length > 0) {
          ;[row] = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(post)
            .innerJoin(board, eq(post.boardId, board.id))
            .innerJoin(postTag, eq(postTag.postId, post.id))
            .innerJoin(tag, eq(postTag.tagId, tag.id))
            .where(and(...filters, inArray(tag.slug, tagSlugs)))
            .limit(1)
        } else {
          ;[row] = await ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(post)
            .innerJoin(board, eq(post.boardId, board.id))
            .where(and(...filters))
            .limit(1)
        }

        c.header("Cache-Control", "public, max-age=10, stale-while-revalidate=60")
        return c.superjson({ count: Number(row?.count || 0) })
      }),

    updatePostMeta: privateProcedure
      .input(updatePostMetaSchema)
      .post(async ({ ctx, input, c }) => {
        const [p] = await ctx.db
          .select({ id: post.id, boardId: post.boardId, title: post.title, slug: post.slug, roadmapStatus: post.roadmapStatus })
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
          const perms = (member?.permissions || {}) as Record<string, boolean>
          if (member?.role === "admin" || perms?.canManageBoards || perms?.canModerateAllBoards) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const patch: Partial<typeof post.$inferSelect> = {}
        if (input.roadmapStatus !== undefined) patch.roadmapStatus = input.roadmapStatus
        if (input.isPinned !== undefined) patch.isPinned = input.isPinned
        if (input.isLocked !== undefined) patch.isLocked = input.isLocked
        if (input.isFeatured !== undefined) patch.isFeatured = input.isFeatured
        if (Object.keys(patch).length === 0) return c.superjson({ ok: true })
        patch.updatedAt = new Date()

        await ctx.db.update(post).set(patch).where(eq(post.id, input.postId))

        const fromStatus = input.roadmapStatus !== undefined ? p.roadmapStatus : null
        const toStatus = input.roadmapStatus !== undefined ? input.roadmapStatus : p.roadmapStatus

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "post_meta_updated",
          actionType: "update",
          entity: "post",
          entityId: String(input.postId),
          title: p.title,
          metadata: {
            roadmapStatus: toStatus,
            fromStatus,
            toStatus,
            isPinned: input.isPinned,
            isLocked: input.isLocked,
            isFeatured: input.isFeatured,
            boardId: p.boardId,
            slug: p.slug,
          },
        })

        return c.superjson({ ok: true })
      }),

    updatePostBoard: privateProcedure
      .input(updatePostBoardSchema)
      .post(async ({ ctx, input, c }) => {
        const [p] = await ctx.db
          .select({ id: post.id, boardId: post.boardId, title: post.title, slug: post.slug, roadmapStatus: post.roadmapStatus })
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
          const perms = (member?.permissions || {}) as Record<string, boolean>
          if (member?.role === "admin" || perms?.canManageBoards || perms?.canModerateAllBoards) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        await ctx.db.update(post).set({ boardId: targetBoard.id, updatedAt: new Date() }).where(eq(post.id, input.postId))

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: "post_board_updated",
          actionType: "update",
          entity: "post",
          entityId: String(input.postId),
          title: p.title,
          metadata: {
            roadmapStatus: p.roadmapStatus,
            fromBoardId: p.boardId,
            toBoardId: targetBoard.id,
            slug: p.slug,
          },
        })

        return c.superjson({ ok: true })
      }),
  })
}
