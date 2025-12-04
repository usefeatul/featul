import { eq, and, sql, desc } from "drizzle-orm"
import { j, privateProcedure, publicProcedure } from "../jstack"
import { comment, commentReaction, commentReport, post, board, user, workspace, workspaceMember } from "@feedgot/db"
import { auth } from "@feedgot/auth"
import { headers } from "next/headers"
import {
  createCommentInputSchema,
  updateCommentInputSchema,
  deleteCommentInputSchema,
  listCommentsInputSchema,
  upvoteCommentInputSchema,
  reportCommentInputSchema,
} from "../validators/comment"
import { HTTPException } from "hono/http-exception"

export function createCommentRouter() {
  return j.router({
    // List all comments for a post (public)
    list: publicProcedure
      .input(listCommentsInputSchema)
      .get(async ({ ctx, input, c }) => {
        const { postId } = input

        // Check if post exists and get board settings
        const [targetPost] = await ctx.db
          .select({
            postId: post.id,
            boardId: board.id,
            allowComments: board.allowComments,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(eq(post.id, postId))
          .limit(1)

        if (!targetPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        if (!targetPost.allowComments) {
          return c.superjson({ comments: [] })
        }

        // Fetch all comments with author info
        const comments = await ctx.db
          .select({
            id: comment.id,
            postId: comment.postId,
            parentId: comment.parentId,
            content: comment.content,
            authorId: comment.authorId,
            authorName: comment.authorName,
            authorEmail: comment.authorEmail,
            isAnonymous: comment.isAnonymous,
            status: comment.status,
            upvotes: comment.upvotes,
            replyCount: comment.replyCount,
            depth: comment.depth,
            isPinned: comment.isPinned,
            isEdited: comment.isEdited,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            editedAt: comment.editedAt,
            metadata: comment.metadata,
            // Author info from user table
            userName: user.name,
            userImage: user.image,
          })
          .from(comment)
          .leftJoin(user, eq(comment.authorId, user.id))
          .where(and(eq(comment.postId, postId), eq(comment.status, "published")))
          .orderBy(desc(comment.isPinned), desc(comment.createdAt))

        // Get user's upvoted comments if authenticated
        let userUpvotes: Set<string> = new Set()
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          })
          if (session?.user?.id) {
            const upvotes = await ctx.db
              .select({ commentId: commentReaction.commentId })
              .from(commentReaction)
              .where(
                and(
                  eq(commentReaction.userId, session.user.id),
                  eq(commentReaction.type, "like")
                )
              )
            userUpvotes = new Set(upvotes.map((v: { commentId: string }) => v.commentId))
          }
        } catch {
          // Session not available, user is not authenticated
          // This is fine for public endpoints
        }

        // Format comments with avatar and hasVoted
        const toAvatar = (seed?: string | null) =>
          `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
            (seed || "anonymous").trim() || "anonymous"
          )}`

        const formattedComments = comments.map((c: any) => ({
          ...c,
          authorImage:
            c.userImage || toAvatar(c.authorName || c.authorEmail || c.authorId),
          authorName: c.userName || c.authorName || "Anonymous",
          hasVoted: userUpvotes.has(c.id),
        }))

        return c.superjson({ comments: formattedComments })
      }),

    // Create a new comment
    create: privateProcedure
      .input(createCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { postId, content, parentId, metadata } = input
        const userId = ctx.session.user.id

        // Check if post exists and comments are allowed
        const [targetPost] = await ctx.db
          .select({
            postId: post.id,
            isLocked: post.isLocked,
            boardId: board.id,
            allowComments: board.allowComments,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .where(eq(post.id, postId))
          .limit(1)

        if (!targetPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        if (!targetPost.allowComments) {
          throw new HTTPException(403, { message: "Comments are disabled for this board" })
        }

        if (targetPost.isLocked) {
          throw new HTTPException(403, { message: "This post is locked" })
        }

        // Get user info
        const [author] = await ctx.db
          .select({ name: user.name, email: user.email })
          .from(user)
          .where(eq(user.id, userId))
          .limit(1)

        let depth = 0
        if (parentId) {
          // Verify parent comment exists and get depth
          const [parentComment] = await ctx.db
            .select({ id: comment.id, depth: comment.depth, postId: comment.postId })
            .from(comment)
            .where(eq(comment.id, parentId))
            .limit(1)

          if (!parentComment) {
            throw new HTTPException(404, { message: "Parent comment not found" })
          }

          if (parentComment.postId !== postId) {
            throw new HTTPException(400, { message: "Parent comment belongs to different post" })
          }

          depth = (parentComment.depth || 0) + 1

          // Update parent comment reply count
          await ctx.db
            .update(comment)
            .set({
              replyCount: sql`${comment.replyCount} + 1`,
            })
            .where(eq(comment.id, parentId))
        }

        // Create comment
        const [newComment] = await ctx.db
          .insert(comment)
          .values({
            postId,
            parentId: parentId || null,
            content,
            authorId: userId,
            authorName: author?.name || null,
            authorEmail: author?.email || null,
            depth,
            status: "published",
            metadata: metadata || null,
          })
          .returning()

        // Update post comment count
        await ctx.db
          .update(post)
          .set({
            commentCount: sql`${post.commentCount} + 1`,
          })
          .where(eq(post.id, postId))

        return c.superjson({ comment: newComment })
      }),

    // Update a comment
    update: privateProcedure
      .input(updateCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId, content } = input
        const userId = ctx.session.user.id

        // Check if comment exists and user is author
        const [existingComment] = await ctx.db
          .select()
          .from(comment)
          .where(eq(comment.id, commentId))
          .limit(1)

        if (!existingComment) {
          throw new HTTPException(404, { message: "Comment not found" })
        }

        if (existingComment.authorId !== userId) {
          throw new HTTPException(403, { message: "You can only edit your own comments" })
        }

        // Update comment
        const [updatedComment] = await ctx.db
          .update(comment)
          .set({
            content,
            isEdited: true,
            editedAt: new Date(),
          })
          .where(eq(comment.id, commentId))
          .returning()

        return c.superjson({ comment: updatedComment })
      }),

    // Delete a comment
    delete: privateProcedure
      .input(deleteCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId } = input
        const userId = ctx.session.user.id

        // Check if comment exists and get post/workspace info
        const [existingComment] = await ctx.db
          .select({
            id: comment.id,
            authorId: comment.authorId,
            postId: comment.postId,
          })
          .from(comment)
          .where(eq(comment.id, commentId))
          .limit(1)

        if (!existingComment) {
          throw new HTTPException(404, { message: "Comment not found" })
        }

        // Check if user is comment author
        const isAuthor = existingComment.authorId === userId

        // Check if user is workspace owner
        let isWorkspaceOwner = false
        if (!isAuthor) {
          const [postInfo] = await ctx.db
            .select({
              postId: post.id,
              workspaceId: workspace.id,
              ownerId: workspace.ownerId,
            })
            .from(post)
            .innerJoin(board, eq(post.boardId, board.id))
            .innerJoin(workspace, eq(board.workspaceId, workspace.id))
            .where(eq(post.id, existingComment.postId))
            .limit(1)

          if (postInfo) {
            isWorkspaceOwner = postInfo.ownerId === userId
          }
        }

        if (!isAuthor && !isWorkspaceOwner) {
          throw new HTTPException(403, { message: "You can only delete your own comments or be the workspace owner" })
        }

        // Soft delete - set status to deleted
        await ctx.db
          .update(comment)
          .set({
            status: "deleted",
            content: "[deleted]",
          })
          .where(eq(comment.id, commentId))

        // Update post comment count
        await ctx.db
          .update(post)
          .set({
            commentCount: sql`greatest(0, ${post.commentCount} - 1)`,
          })
          .where(eq(post.id, existingComment.postId))

        // Update parent reply count if this was a reply
        if (existingComment.parentId) {
          await ctx.db
            .update(comment)
            .set({
              replyCount: sql`greatest(0, ${comment.replyCount} - 1)`,
            })
            .where(eq(comment.id, existingComment.parentId))
        }

        return c.superjson({ success: true })
      }),

    // Upvote/unvote a comment
    upvote: privateProcedure
      .input(upvoteCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId } = input
        const userId = ctx.session.user.id

        // Check if comment exists
        const [targetComment] = await ctx.db
          .select({ id: comment.id })
          .from(comment)
          .where(eq(comment.id, commentId))
          .limit(1)

        if (!targetComment) {
          throw new HTTPException(404, { message: "Comment not found" })
        }

        // Check if user already upvoted
        const [existingReaction] = await ctx.db
          .select()
          .from(commentReaction)
          .where(
            and(
              eq(commentReaction.commentId, commentId),
              eq(commentReaction.userId, userId),
              eq(commentReaction.type, "like")
            )
          )
          .limit(1)

        if (existingReaction) {
          // Remove upvote
          await ctx.db
            .delete(commentReaction)
            .where(eq(commentReaction.id, existingReaction.id))

          const [updatedComment] = await ctx.db
            .update(comment)
            .set({
              upvotes: sql`greatest(0, ${comment.upvotes} - 1)`,
            })
            .where(eq(comment.id, commentId))
            .returning({ upvotes: comment.upvotes })

          return c.superjson({ upvotes: updatedComment?.upvotes || 0, hasVoted: false })
        } else {
          // Add upvote
          await ctx.db.insert(commentReaction).values({
            commentId,
            userId,
            type: "like",
          })

          const [updatedComment] = await ctx.db
            .update(comment)
            .set({
              upvotes: sql`${comment.upvotes} + 1`,
            })
            .where(eq(comment.id, commentId))
            .returning({ upvotes: comment.upvotes })

          return c.superjson({ upvotes: updatedComment?.upvotes || 0, hasVoted: true })
        }
      }),

    // Report a comment
    report: privateProcedure
      .input(reportCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId, reason, description } = input
        const userId = ctx.session.user.id

        // Check if comment exists
        const [targetComment] = await ctx.db
          .select({ id: comment.id })
          .from(comment)
          .where(eq(comment.id, commentId))
          .limit(1)

        if (!targetComment) {
          throw new HTTPException(404, { message: "Comment not found" })
        }

        // Create report
        await ctx.db.insert(commentReport).values({
          commentId,
          reportedBy: userId,
          reason,
          description: description || null,
          status: "pending",
        })

        return c.superjson({ success: true })
      }),
  })
}

