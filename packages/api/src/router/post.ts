import { eq, and, sql, isNull, ilike, or } from "drizzle-orm"
import { j, publicProcedure } from "../jstack"
import { vote, post, workspace, board, postTag, workspaceMember, postReport, postMerge, comment, activityLog } from "@oreilla/db"
import { votePostSchema, createPostSchema, updatePostSchema, byIdSchema, reportPostSchema, getSimilarSchema, mergePostSchema, mergeHerePostSchema, searchMergeCandidatesSchema } from "../validators/post"
import { HTTPException } from "hono/http-exception"
import { auth } from "@oreilla/auth"
import { headers } from "next/headers"
import { mapPermissions } from "../shared/permissions"

export function createPostRouter() {
  return j.router({
    create: publicProcedure
      .input(createPostSchema)
      .post(async ({ ctx, input, c }) => {
        const { title, content, image, workspaceSlug, boardSlug, fingerprint, roadmapStatus, tags } = input

        let userId: string | null = null
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            userId = session.user.id
          }
        } catch {}

        // Resolve Workspace
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        // Resolve Board
        const [b] = await ctx.db
          .select({ id: board.id, allowAnonymous: board.allowAnonymous })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.slug, boardSlug)))
          .limit(1)
        if (!b) throw new HTTPException(404, { message: "Board not found" })

        // Check permissions
        if (!userId) {
            if (!b.allowAnonymous) {
                throw new HTTPException(401, { message: "Anonymous posting is not allowed on this board" })
            }
            if (!fingerprint) {
                throw new HTTPException(400, { message: "Fingerprint required for anonymous posting" })
            }
        }

        // Generate slug
        const slugBase = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const randomSuffix = Math.random().toString(36).substring(2, 8)
        const slug = slugBase ? `${slugBase}-${randomSuffix}` : `post-${randomSuffix}`

        // Create Post
        const [newPost] = await ctx.db.insert(post).values({
            boardId: b.id,
            title,
            content,
            image,
            slug,
            authorId: userId || null,
            isAnonymous: !userId,
            metadata: !userId ? { fingerprint } : undefined,
            roadmapStatus: roadmapStatus || "pending",
        }).returning()

        // Insert tags
        if (tags && tags.length > 0) {
            await ctx.db.insert(postTag).values(
                tags.map((tagId) => ({
                    postId: newPost.id,
                    tagId,
                }))
            )
        }

        // Auto-upvote
        await ctx.db.insert(vote).values({
            postId: newPost.id,
            userId: userId || null,
            fingerprint: userId ? null : fingerprint || null,
            type: 'upvote'
        })
        
        // Update post upvotes
        await ctx.db.update(post).set({ upvotes: 1 }).where(eq(post.id, newPost.id))
        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId,
          action: "post_created",
          actionType: "create",
          entity: "post",
          entityId: String(newPost.id),
          title: newPost.title,
          metadata: {
            boardId: b.id,
            slug: newPost.slug,
            roadmapStatus: newPost.roadmapStatus,
            tags: tags || [],
            isAnonymous: !userId,
          },
        })

        return c.superjson({ post: newPost })
      }),

    update: publicProcedure
      .input(updatePostSchema)
      .post(async ({ ctx, input, c }) => {
        const { postId, title, content, image, boardSlug, roadmapStatus, tags } = input

        let userId: string | null = null
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            userId = session.user.id
          }
        } catch {}

        if (!userId) {
          throw new HTTPException(401, { message: "Unauthorized" })
        }

        // Get existing post
        const [existingPost] = await ctx.db
          .select()
          .from(post)
          .where(eq(post.id, postId))
          .limit(1)

        if (!existingPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        // Check ownership and permissions
        let allowed = existingPost.authorId === userId
        if (!allowed) {
            // Fetch workspace and check if user is admin/owner
            const [b] = await ctx.db
                .select({ workspaceId: board.workspaceId })
                .from(board)
                .where(eq(board.id, existingPost.boardId))
                .limit(1)
            
            if (b) {
                const [ws] = await ctx.db
                    .select({ ownerId: workspace.ownerId })
                    .from(workspace)
                    .where(eq(workspace.id, b.workspaceId))
                    .limit(1)
                
                if (ws) {
                    if (ws.ownerId === userId) {
                        allowed = true
                    } else {
                        const [member] = await ctx.db
                            .select({ role: workspaceMember.role })
                            .from(workspaceMember)
                            .where(and(eq(workspaceMember.workspaceId, b.workspaceId), eq(workspaceMember.userId, userId)))
                            .limit(1)
                        
                        if (member) {
                            const perms = mapPermissions(member.role)
                            if (perms.canModerateAllBoards) {
                                allowed = true
                            }
                        }
                    }
                }
            }
        }

        if (!allowed) {
           throw new HTTPException(403, { message: "You don't have permission to edit this post" })
        }

        // Resolve Board if changing
        let boardId = existingPost.boardId
        if (boardSlug) {
           // First get the workspaceId from the current board of the post
           const [currentBoard] = await ctx.db
             .select({ workspaceId: board.workspaceId })
             .from(board)
             .where(eq(board.id, existingPost.boardId))
             .limit(1)

           if (currentBoard) {
             const [b] = await ctx.db
              .select({ id: board.id })
              .from(board)
              .where(and(
                eq(board.workspaceId, currentBoard.workspaceId), 
                eq(board.slug, boardSlug)
              ))
              .limit(1)
             if (b) boardId = b.id
           }
        }

        // Update Post
        const [updatedPost] = await ctx.db
          .update(post)
          .set({
            title: title ?? existingPost.title,
            content: content ?? existingPost.content,
            image: image !== undefined ? image : existingPost.image,
            boardId,
            roadmapStatus: roadmapStatus ?? existingPost.roadmapStatus,
            updatedAt: new Date(),
          })
          .where(eq(post.id, postId))
          .returning()

        // Update tags if provided
        if (tags) {
            // Delete existing tags
            await ctx.db.delete(postTag).where(eq(postTag.postId, postId))
            
            // Insert new tags
            if (tags.length > 0) {
                await ctx.db.insert(postTag).values(
                    tags.map((tagId) => ({
                        postId,
                        tagId,
                    }))
                )
            }
        }

        const [boardRow] = await ctx.db
          .select({ workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, boardId))
          .limit(1)

        if (boardRow) {
          const fromStatus = roadmapStatus !== undefined ? existingPost.roadmapStatus : null
          const toStatus = roadmapStatus !== undefined ? roadmapStatus : updatedPost.roadmapStatus

          await ctx.db.insert(activityLog).values({
            workspaceId: boardRow.workspaceId,
            userId,
            action: "post_updated",
            actionType: "update",
            entity: "post",
            entityId: String(updatedPost.id),
            title: updatedPost.title,
            metadata: {
              boardId,
              roadmapStatus: toStatus,
              fromStatus,
              toStatus,
              hasTitleChange: title !== undefined && title !== existingPost.title,
              hasContentChange: content !== undefined && content !== existingPost.content,
              hasTagsChange: Array.isArray(tags),
            },
          })
        }

        return c.superjson({ post: updatedPost })
      }),

    delete: publicProcedure
      .input(byIdSchema)
      .post(async ({ ctx, input, c }) => {
        const { postId } = input

        let userId: string | null = null
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            userId = session.user.id
          }
        } catch {}

        if (!userId) {
          throw new HTTPException(401, { message: "Unauthorized" })
        }

        // Get existing post
        const [existingPost] = await ctx.db
          .select()
          .from(post)
          .where(eq(post.id, postId))
          .limit(1)

        if (!existingPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        // Check ownership and permissions
        let allowed = existingPost.authorId === userId
        if (!allowed) {
            // Fetch workspace and check if user is admin/owner
            const [b] = await ctx.db
                .select({ workspaceId: board.workspaceId })
                .from(board)
                .where(eq(board.id, existingPost.boardId))
                .limit(1)
            
            if (b) {
                const [ws] = await ctx.db
                    .select({ ownerId: workspace.ownerId })
                    .from(workspace)
                    .where(eq(workspace.id, b.workspaceId))
                    .limit(1)
                
                if (ws) {
                    if (ws.ownerId === userId) {
                        allowed = true
                    } else {
                        const [member] = await ctx.db
                            .select({ role: workspaceMember.role })
                            .from(workspaceMember)
                            .where(and(eq(workspaceMember.workspaceId, b.workspaceId), eq(workspaceMember.userId, userId)))
                            .limit(1)
                        
                        if (member) {
                            const perms = mapPermissions(member.role)
                            if (perms.canModerateAllBoards) {
                                allowed = true
                            }
                        }
                    }
                }
            }
        }

        if (!allowed) {
           throw new HTTPException(403, { message: "You don't have permission to delete this post" })
        }

        const [boardRow] = await ctx.db
          .select({ workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, existingPost.boardId))
          .limit(1)

        await ctx.db.delete(post).where(eq(post.id, postId))

        if (boardRow) {
          await ctx.db.insert(activityLog).values({
            workspaceId: boardRow.workspaceId,
            userId,
            action: "post_deleted",
            actionType: "delete",
            entity: "post",
            entityId: String(postId),
            title: existingPost.title,
            metadata: {
              boardId: existingPost.boardId,
              slug: existingPost.slug,
              roadmapStatus: existingPost.roadmapStatus,
            },
          })
        }

        return c.superjson({ success: true })
      }),

    report: publicProcedure
      .input(reportPostSchema)
      .post(async ({ ctx, input, c }) => {
        const { postId, reason, description } = input

        let userId: string | null = null
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            userId = session.user.id
          }
        } catch {}

        if (!userId) {
          throw new HTTPException(401, { message: "Unauthorized" })
        }

        // Check if post exists
        const [existingPost] = await ctx.db
          .select({
            id: post.id,
            boardId: post.boardId,
            title: post.title,
            slug: post.slug,
            roadmapStatus: post.roadmapStatus,
          })
          .from(post)
          .where(eq(post.id, postId))
          .limit(1)

        if (!existingPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        // Create report
        await ctx.db.insert(postReport).values({
          postId,
          reportedBy: userId,
          reason,
          description: description || null,
          status: "pending",
        })

        const [boardRow] = await ctx.db
          .select({ workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, existingPost.boardId))
          .limit(1)

        if (boardRow) {
          await ctx.db.insert(activityLog).values({
            workspaceId: boardRow.workspaceId,
            userId,
            action: "post_reported",
            actionType: "create",
            entity: "post",
            entityId: String(postId),
            title: existingPost.title,
            metadata: {
              reason,
              hasDescription: Boolean(description),
              roadmapStatus: existingPost.roadmapStatus,
              slug: existingPost.slug,
            },
          })
        }

        return c.superjson({ success: true })
      }),

    vote: publicProcedure
      .input(votePostSchema)
      .post(async ({ ctx, input, c }) => {
        const { postId, fingerprint } = input
        
        let userId: string | null = null
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            userId = session.user.id
          }
        } catch {}

        if (!userId && !fingerprint) {
             throw new HTTPException(400, { message: "Missing identification" })
        }

        // Check if post exists
        const [targetPost] = await ctx.db
          .select({
            id: post.id,
            boardId: post.boardId,
            title: post.title,
            roadmapStatus: post.roadmapStatus,
          })
          .from(post)
          .where(eq(post.id, postId))
          .limit(1)
        
        if (!targetPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        const [boardRow] = await ctx.db
          .select({ workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, targetPost.boardId))
          .limit(1)

        let existingVote
        
        if (userId) {
             [existingVote] = await ctx.db
            .select()
            .from(vote)
            .where(and(eq(vote.postId, postId), eq(vote.userId, userId)))
            .limit(1)
        } else if (fingerprint) {
             [existingVote] = await ctx.db
            .select()
            .from(vote)
            .where(and(eq(vote.postId, postId), isNull(vote.userId), eq(vote.fingerprint, fingerprint)))
            .limit(1)
        }

        if (existingVote) {
          // Remove vote
          await ctx.db.delete(vote).where(eq(vote.id, existingVote.id))
          
          const [updatedPost] = await ctx.db
            .update(post)
            .set({ 
              upvotes: sql`greatest(0, ${post.upvotes} - 1)` 
            })
            .where(eq(post.id, postId))
            .returning({ upvotes: post.upvotes })

          if (boardRow) {
            await ctx.db.insert(activityLog).values({
              workspaceId: boardRow.workspaceId,
              userId,
              action: "post_vote_removed",
              actionType: "delete",
              entity: "post",
              entityId: String(postId),
              title: targetPost.title,
              metadata: {
                roadmapStatus: targetPost.roadmapStatus,
                fingerprint: userId ? null : fingerprint || null,
              },
            })
          }

          return c.superjson({ upvotes: updatedPost?.upvotes || 0, hasVoted: false })
        } else {
          // Add vote
          await ctx.db.insert(vote).values({
            postId,
            userId: userId || null,
            fingerprint: userId ? null : fingerprint || null,
            type: 'upvote'
          })

          const [updatedPost] = await ctx.db
            .update(post)
            .set({ 
              upvotes: sql`${post.upvotes} + 1` 
            })
            .where(eq(post.id, postId))
            .returning({ upvotes: post.upvotes })

          if (boardRow) {
            await ctx.db.insert(activityLog).values({
              workspaceId: boardRow.workspaceId,
              userId,
              action: "post_voted",
              actionType: "create",
              entity: "post",
              entityId: String(postId),
              title: targetPost.title,
              metadata: {
                roadmapStatus: targetPost.roadmapStatus,
                fingerprint: userId ? null : fingerprint || null,
              },
            })
          }

          return c.superjson({ upvotes: updatedPost?.upvotes || 0, hasVoted: true })
        }
      }),

    getSimilar: publicProcedure
      .input(getSimilarSchema)
      .get(async ({ ctx, input, c }) => {
        const { title, boardSlug, workspaceSlug } = input
        
        // Resolve Workspace first
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
             return c.superjson({ posts: [] })
        }

        // Resolve Board within Workspace
        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(
            eq(board.workspaceId, ws.id),
            eq(board.slug, boardSlug)
          ))
          .limit(1)

        if (!b) {
             return c.superjson({ posts: [] })
        }
        
        // Split title into words for better matching
        const words = title.trim().split(/\s+/).filter(w => w.length > 2)
        
        let searchCondition = ilike(post.title, `%${title}%`)
        
        if (words.length > 0) {
            // If we have words, try to match ANY of them, but rank by relevance?
            // For now, let's just find posts that contain ANY of the significant words
            // This is broader than "phrase match"
            searchCondition = or(
                ilike(post.title, `%${title}%`), // Exact phrase match
                ...words.map(w => ilike(post.title, `%${w}%`)) // Or any word match
            ) as any
        }

        const similarPosts = await ctx.db
          .select({
            id: post.id,
            title: post.title,
            slug: post.slug,
            upvotes: post.upvotes,
            commentCount: post.commentCount,
          })
          .from(post)
          .where(and(
            eq(post.boardId, b.id),
            searchCondition
          ))
          .limit(3)
          
        return c.superjson({ posts: similarPosts })
      }),

    getVoteStatus: publicProcedure
      .input(votePostSchema)
      .get(async ({ ctx, input, c }) => {
        const { postId, fingerprint } = input
        
        let userId: string | null = null
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            userId = session.user.id
          }
        } catch {}

        let hasVoted = false
        
        if (userId) {
             const [existing] = await ctx.db
            .select({ id: vote.id })
            .from(vote)
            .where(and(eq(vote.postId, postId), eq(vote.userId, userId)))
            .limit(1)
            hasVoted = !!existing
        } else if (fingerprint) {
             const [existing] = await ctx.db
            .select({ id: vote.id })
            .from(vote)
            .where(and(eq(vote.postId, postId), isNull(vote.userId), eq(vote.fingerprint, fingerprint)))
            .limit(1)
            hasVoted = !!existing
        }
        
        return c.superjson({ hasVoted })
      }),

    merge: publicProcedure
      .input(mergePostSchema)
      .post(async ({ ctx, input, c }) => {
        const { postId, targetPostId, mergeType, reason } = input

        let userId: string | null = null
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            userId = session.user.id
          }
        } catch {}

        if (!userId) {
          throw new HTTPException(401, { message: "Unauthorized" })
        }

        // Get both posts
        const [sourcePost] = await ctx.db
          .select()
          .from(post)
          .where(eq(post.id, postId))
          .limit(1)

        const [targetPost] = await ctx.db
          .select()
          .from(post)
          .where(eq(post.id, targetPostId))
          .limit(1)

        if (!sourcePost || !targetPost) {
          throw new HTTPException(404, { message: "One or both posts not found" })
        }

        if (sourcePost.id === targetPost.id) {
          throw new HTTPException(400, { message: "Cannot merge a post with itself" })
        }

        // Check permissions - user must be able to moderate both posts
        const [sourceBoard] = await ctx.db
          .select({ workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, sourcePost.boardId))
          .limit(1)

        const [targetBoard] = await ctx.db
          .select({ workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, targetPost.boardId))
          .limit(1)

        if (!sourceBoard || !targetBoard) {
          throw new HTTPException(404, { message: "Board not found" })
        }

        if (sourceBoard.workspaceId !== targetBoard.workspaceId) {
          throw new HTTPException(400, { message: "Cannot merge posts from different workspaces" })
        }

        // Check workspace permissions
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.id, sourceBoard.workspaceId))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        let allowed = ws.ownerId === userId
        if (!allowed) {
          const [member] = await ctx.db
            .select({ role: workspaceMember.role })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, sourceBoard.workspaceId), eq(workspaceMember.userId, userId)))
            .limit(1)
          
          if (member) {
            const perms = mapPermissions(member.role)
            if (perms.canModerateAllBoards) {
              allowed = true
            }
          }
        }

        if (!allowed) {
          throw new HTTPException(403, { message: "You don't have permission to merge posts" })
        }

        // Check if merge already exists
        const [existingMerge] = await ctx.db
          .select()
          .from(postMerge)
          .where(or(
            and(eq(postMerge.sourcePostId, sourcePost.id), eq(postMerge.targetPostId, targetPost.id)),
            and(eq(postMerge.sourcePostId, targetPost.id), eq(postMerge.targetPostId, sourcePost.id))
          ))
          .limit(1)

        if (existingMerge) {
          throw new HTTPException(400, { message: "These posts are already merged" })
        }

        // Create merge record
        const [mergeRecord] = await ctx.db.insert(postMerge).values({
          sourcePostId: sourcePost.id,
          targetPostId: targetPost.id,
          mergedBy: userId,
          mergeType,
          reason: reason || null,
          metadata: {
            consolidatedVotes: true,
            transferredComments: true,
            transferredTags: true,
          }
        }).returning()

        // Consolidate votes (transfer upvotes from source to target)
        await ctx.db
          .update(post)
          .set({ 
            upvotes: sql`${post.upvotes} + ${sourcePost.upvotes}`
          })
          .where(eq(post.id, targetPost.id))

        // Archive the source post
        await ctx.db
          .update(post)
          .set({ 
            status: 'archived',
            duplicateOfId: targetPost.id
          })
          .where(eq(post.id, sourcePost.id))

        // Transfer comments from source to target
        await ctx.db
          .update(comment)
          .set({ postId: targetPost.id })
          .where(eq(comment.postId, sourcePost.id))

        // Transfer tags from source to target (avoiding duplicates)
        const sourceTags = await ctx.db
          .select({ tagId: postTag.tagId })
          .from(postTag)
          .where(eq(postTag.postId, sourcePost.id))

        const targetTags = await ctx.db
          .select({ tagId: postTag.tagId })
          .from(postTag)
          .where(eq(postTag.postId, targetPost.id))

        const targetTagIds = new Set((targetTags as Array<{ tagId: string }>).map((t) => t.tagId))
        const tagsToTransfer = (sourceTags as Array<{ tagId: string }>).filter((st) => !targetTagIds.has(st.tagId))

        if (tagsToTransfer.length > 0) {
          await ctx.db.insert(postTag).values(
            (tagsToTransfer as Array<{ tagId: string }>).map((st) => ({
              postId: targetPost.id,
              tagId: st.tagId,
            }))
          )
        }

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId,
          action: "post_merged",
          actionType: "update",
          entity: "post",
          entityId: String(targetPost.id),
          title: targetPost.title,
          metadata: {
            sourcePostId: sourcePost.id,
            mergeType,
            reason: reason || null,
            roadmapStatus: targetPost.roadmapStatus,
          },
        })

        return c.superjson({ success: true, merge: mergeRecord })
      }),

    mergeHere: publicProcedure
      .input(mergeHerePostSchema)
      .post(async ({ ctx, input, c }) => {
        const { postId, sourcePostIds, reason } = input

        let userId: string | null = null
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            userId = session.user.id
          }
        } catch {}

        if (!userId) {
          throw new HTTPException(401, { message: "Unauthorized" })
        }

        // Resolve target post
        const [targetPost] = await ctx.db
          .select()
          .from(post)
          .where(eq(post.id, postId))
          .limit(1)
        if (!targetPost) throw new HTTPException(404, { message: "Target post not found" })

        const [targetBoard] = await ctx.db
          .select({ workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, targetPost.boardId))
          .limit(1)
        if (!targetBoard) throw new HTTPException(404, { message: "Board not found" })

        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.id, targetBoard.workspaceId))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        let allowed = ws.ownerId === userId
        if (!allowed) {
          const [member] = await ctx.db
            .select({ role: workspaceMember.role })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, targetBoard.workspaceId), eq(workspaceMember.userId, userId)))
            .limit(1)
          if (member) {
            const perms = mapPermissions(member.role)
            if (perms.canModerateAllBoards) {
              allowed = true
            }
          }
        }
        if (!allowed) throw new HTTPException(403, { message: "You don't have permission to merge posts" })

        // Process each source post
        for (const sourceId of sourcePostIds) {
          if (sourceId === postId) continue

          const [sourcePost] = await ctx.db
            .select()
            .from(post)
            .where(eq(post.id, sourceId))
            .limit(1)
          if (!sourcePost) continue

          const [sourceBoard] = await ctx.db
            .select({ workspaceId: board.workspaceId })
            .from(board)
            .where(eq(board.id, sourcePost.boardId))
            .limit(1)
          if (!sourceBoard) continue
          if (sourceBoard.workspaceId !== targetBoard.workspaceId) continue

          // Skip if already merged
          const [existingMerge] = await ctx.db
            .select()
            .from(postMerge)
            .where(and(eq(postMerge.sourcePostId, sourcePost.id), eq(postMerge.targetPostId, targetPost.id)))
            .limit(1)
          if (existingMerge) continue

          // Create merge record
          await ctx.db.insert(postMerge).values({
            sourcePostId: sourcePost.id,
            targetPostId: targetPost.id,
            mergedBy: userId,
            mergeType: 'merge_here',
            reason: reason || null,
            metadata: {
              consolidatedVotes: true,
              transferredComments: true,
              transferredTags: true,
            }
          })

          // Consolidate votes into target
          await ctx.db
            .update(post)
            .set({ 
              upvotes: sql`${post.upvotes} + ${sourcePost.upvotes}`
            })
            .where(eq(post.id, targetPost.id))

          // Archive the source post
          await ctx.db
            .update(post)
            .set({ 
              status: 'archived',
              duplicateOfId: targetPost.id
            })
            .where(eq(post.id, sourcePost.id))

          // Transfer comments
          await ctx.db
            .update(comment)
            .set({ postId: targetPost.id })
            .where(eq(comment.postId, sourcePost.id))

          // Transfer tags avoiding duplicates
          const sourceTags = await ctx.db
            .select({ tagId: postTag.tagId })
            .from(postTag)
            .where(eq(postTag.postId, sourcePost.id))

          const targetTags = await ctx.db
            .select({ tagId: postTag.tagId })
            .from(postTag)
            .where(eq(postTag.postId, targetPost.id))

          const targetTagIds = new Set((targetTags as Array<{ tagId: string }>).map((t) => t.tagId))
          const tagsToTransfer = (sourceTags as Array<{ tagId: string }>).filter((st) => !targetTagIds.has(st.tagId))

          if (tagsToTransfer.length > 0) {
            await ctx.db.insert(postTag).values(
              (tagsToTransfer as Array<{ tagId: string }>).map((st) => ({
                postId: targetPost.id,
                tagId: st.tagId,
              }))
            )
          }

          await ctx.db.insert(activityLog).values({
            workspaceId: ws.id,
            userId,
            action: "post_merged",
            actionType: "update",
            entity: "post",
            entityId: String(targetPost.id),
            title: targetPost.title,
            metadata: {
              sourcePostId: sourcePost.id,
              mergeType: "merge_here",
              reason: reason || null,
            },
          })
        }

        return c.superjson({ success: true })
      }),

    searchMergeCandidates: publicProcedure
      .input(searchMergeCandidatesSchema)
      .get(async ({ ctx, input, c }) => {
        const { postId, query, excludeSelf } = input

        // Get the current post to find its workspace
        const [currentPost] = await ctx.db
          .select()
          .from(post)
          .where(eq(post.id, postId))
          .limit(1)

        if (!currentPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        const [currentBoard] = await ctx.db
          .select({ workspaceId: board.workspaceId })
          .from(board)
          .where(eq(board.id, currentPost.boardId))
          .limit(1)

        if (!currentBoard) {
          throw new HTTPException(404, { message: "Board not found" })
        }

        const searchTerm = `%${query}%`

        let candidates = await ctx.db
          .select({
            id: post.id,
            title: post.title,
            slug: post.slug,
            upvotes: post.upvotes,
            commentCount: post.commentCount,
            createdAt: post.createdAt,
            boardName: board.name,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(and(
            eq(board.workspaceId, currentBoard.workspaceId),
            eq(post.status, 'published'),
            excludeSelf ? sql`${post.id} != ${postId}` : sql`true`,
            sql`(${post.title} ilike ${searchTerm} or ${post.content} ilike ${searchTerm})`
          ))
          .orderBy(sql`${post.upvotes} desc`)
          .limit(10)

        return c.superjson({ candidates })
      }),
  })
}
