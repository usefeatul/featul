import { eq, and, sql, desc, or, isNull } from "drizzle-orm";
import { j, privateProcedure, publicProcedure } from "../jstack";
import {
  comment,
  commentReaction,
  commentReport,
  commentMention,
  post,
  board,
  user,
  workspace,
  workspaceMember,
} from "@feedgot/db";
import { auth } from "@feedgot/auth";
import { headers } from "next/headers";
import {
  createCommentInputSchema,
  updateCommentInputSchema,
  deleteCommentInputSchema,
  listCommentsInputSchema,
  upvoteCommentInputSchema,
  reportCommentInputSchema,
  pinCommentInputSchema,
  mentionsListInputSchema,
  mentionsMarkReadInputSchema,
} from "../validators/comment";
import { HTTPException } from "hono/http-exception";

export function createCommentRouter() {
  return j.router({
    // List all comments for a post (public)
    list: publicProcedure
      .input(listCommentsInputSchema)
      .get(async ({ ctx, input, c }) => {
        const { postId, fingerprint } = input;

        // Check if post exists and get board/workspace settings
        const [targetPost] = await ctx.db
          .select({
            postId: post.id,
            boardId: board.id,
            allowComments: board.allowComments,
            workspaceId: workspace.id,
            workspaceOwnerId: workspace.ownerId,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .innerJoin(workspace, eq(board.workspaceId, workspace.id))
          .where(eq(post.id, postId))
          .limit(1);

        if (!targetPost) {
          throw new HTTPException(404, { message: "Post not found" });
        }

        if (!targetPost.allowComments) {
          return c.superjson({ comments: [] });
        }

        // Fetch all comments with author info and role
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
            // Role info from workspace member
            memberRole: workspaceMember.role,
            workspaceOwnerId: workspace.ownerId,
          })
          .from(comment)
          .leftJoin(user, eq(comment.authorId, user.id))
          .leftJoin(post, eq(comment.postId, post.id))
          .leftJoin(board, eq(post.boardId, board.id))
          .leftJoin(workspace, eq(board.workspaceId, workspace.id))
          .leftJoin(
            workspaceMember,
            and(
              eq(workspaceMember.workspaceId, workspace.id),
              eq(workspaceMember.userId, comment.authorId),
              eq(workspaceMember.isActive, true)
            )
          )
          .where(
            and(eq(comment.postId, postId), eq(comment.status, "published"))
          )
          .orderBy(desc(comment.isPinned), desc(comment.createdAt));

        // Get user's upvoted comments if authenticated
        let userUpvotes: Set<string> = new Set();
        let userId: string | null = null;
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          });
          if (session?.user?.id) {
            userId = session.user.id;
            const upvotes = await ctx.db
              .select({ commentId: commentReaction.commentId })
              .from(commentReaction)
              .where(
                and(
                  eq(commentReaction.userId, userId),
                  eq(commentReaction.type, "like")
                )
              );
            upvotes.forEach((v: { commentId: string }) => userUpvotes.add(v.commentId));
          }
        } catch {
          // Session not available, user is not authenticated
        }

        // If not authenticated, check for anonymous upvotes
        if (!userId) {
          const forwardedFor = (c as any)?.req?.header("x-forwarded-for");
          const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";
          
          const conditions = [
            isNull(commentReaction.userId),
            eq(commentReaction.type, "like")
          ];

          if (fingerprint) {
            conditions.push(
              or(
                eq(commentReaction.fingerprint, fingerprint),
                eq(commentReaction.ipAddress, ipAddress)
              ) as any
            );
          } else {
            conditions.push(eq(commentReaction.ipAddress, ipAddress));
          }

          const anonymousUpvotes = await ctx.db
            .select({ commentId: commentReaction.commentId })
            .from(commentReaction)
            .where(and(...conditions));
            
          anonymousUpvotes.forEach((v: { commentId: string }) => userUpvotes.add(v.commentId));
        }

        // Format comments with avatar and hasVoted
        const toAvatar = (seed?: string | null) =>
          `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
            (seed || "anonymous").trim() || "anonymous"
          )}`;

        const formattedComments = comments.map((c: any) => {
          const isOwner = c.workspaceOwnerId === c.authorId;
          return {
            ...c,
            authorImage:
              c.userImage ||
              toAvatar(c.authorName || c.authorEmail || c.authorId),
            authorName: c.userName || c.authorName || "Anonymous",
            hasVoted: userUpvotes.has(c.id),
            role: isOwner ? null : c.memberRole || null, // null means owner (handled separately)
            isOwner: Boolean(isOwner),
          };
        });

        return c.superjson({ comments: formattedComments });
      }),

    // Create a new comment
    create: publicProcedure
      .input(createCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { postId, content, parentId, metadata, fingerprint } = input;

        let userId: string | null = null;
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          });
          if (session?.user?.id) {
            userId = session.user.id;
          }
        } catch {
          // User is not authenticated
        }

        // Check if post exists and comments are allowed
        const [targetPost] = await ctx.db
          .select({
            postId: post.id,
            isLocked: post.isLocked,
            boardId: board.id,
            allowComments: board.allowComments,
            workspaceId: workspace.id,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .innerJoin(workspace, eq(board.workspaceId, workspace.id))
          .where(eq(post.id, postId))
          .limit(1);

        if (!targetPost) {
          throw new HTTPException(404, { message: "Post not found" });
        }

        if (!targetPost.allowComments) {
          throw new HTTPException(403, {
            message: "Comments are disabled for this board",
          });
        }

        if (targetPost.isLocked) {
          throw new HTTPException(403, { message: "This post is locked" });
        }

        // Get user info if authenticated
        let authorName: string | null = null;
        let authorEmail: string | null = null;

        if (userId) {
          const [author] = await ctx.db
            .select({ name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);

          authorName = author?.name || null;
          authorEmail = author?.email || null;
        } else {
          authorName = "Anonymous";
        }

        let depth = 0;
        if (parentId) {
          // Verify parent comment exists and get depth
          const [parentComment] = await ctx.db
            .select({
              id: comment.id,
              depth: comment.depth,
              postId: comment.postId,
            })
            .from(comment)
            .where(eq(comment.id, parentId))
            .limit(1);

          if (!parentComment) {
            throw new HTTPException(404, {
              message: "Parent comment not found",
            });
          }

          if (parentComment.postId !== postId) {
            throw new HTTPException(400, {
              message: "Parent comment belongs to different post",
            });
          }

          depth = (parentComment.depth || 0) + 1;

          // Update parent comment reply count
          await ctx.db
            .update(comment)
            .set({
              replyCount: sql`${comment.replyCount} + 1`,
            })
            .where(eq(comment.id, parentId));
        }

        // Create comment
        const [newComment] = await ctx.db
          .insert(comment)
          .values({
            postId,
            parentId: parentId || null,
            content,
            authorId: userId,
            authorName,
            authorEmail,
            depth,
            status: "published",
            metadata: metadata || null,
            isAnonymous: !userId,
          })
          .returning();

        // Parse mentions and persist (only if authenticated)
        try {
          if (userId && content.includes("@")) {
            const members = await ctx.db
              .select({ userId: workspaceMember.userId, name: user.name })
              .from(workspaceMember)
              .innerJoin(user, eq(workspaceMember.userId, user.id))
              .where(
                and(
                  eq(workspaceMember.workspaceId, targetPost.workspaceId),
                  eq(workspaceMember.isActive, true)
                )
              );

            const nameToUserId = new Map<string, string>();
            const allNames: string[] = [];

            for (const m of members) {
              const nm = (m.name || "").trim().toLowerCase();
              if (nm) {
                nameToUserId.set(nm, m.userId);
                allNames.push(nm);
              }
            }

            // Sort by length descending to match longest names first
            allNames.sort((a, b) => b.length - a.length);

            const validUserIds: string[] = [];
            const validNames: string[] = [];
            const uniqueFoundNames = new Set<string>();

            if (allNames.length > 0) {
              const esc = (s: string) =>
                s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              const pattern = new RegExp(
                `@(${allNames.map(esc).join("|")})\\b`,
                "gi"
              );

              let m: RegExpExecArray | null;
              while ((m = pattern.exec(content))) {
                const matchedName = m[1]?.toLowerCase();
                if (matchedName && !uniqueFoundNames.has(matchedName)) {
                  uniqueFoundNames.add(matchedName);
                  const uid = nameToUserId.get(matchedName);
                  if (uid) {
                    validUserIds.push(uid);
                    validNames.push(matchedName);
                  }
                }
              }
            }

            if (validUserIds.length > 0) {
              await ctx.db.insert(commentMention).values(
                validUserIds.map((uid) => ({
                  commentId: newComment.id,
                  mentionedUserId: uid,
                  mentionedBy: userId!,
                }))
              );

              const nextMeta = {
                ...(newComment.metadata || {}),
                mentions: validNames,
              } as any;
              await ctx.db
                .update(comment)
                .set({ metadata: nextMeta })
                .where(eq(comment.id, newComment.id));
            }
          }
        } catch {}

        // Auto-upvote the comment by the author
        const forwardedFor = (c as any)?.req?.header("x-forwarded-for");
        const ipAddress = forwardedFor
          ? forwardedFor.split(",")[0]
          : "127.0.0.1";

        await ctx.db.insert(commentReaction).values({
          commentId: newComment.id,
          userId: userId || null,
          ipAddress: userId ? null : ipAddress,
          fingerprint: userId ? null : fingerprint || null,
          type: "like",
        });

        const [finalComment] = await ctx.db
          .update(comment)
          .set({
            upvotes: 1,
          })
          .where(eq(comment.id, newComment.id))
          .returning();

        // Update post comment count
        await ctx.db
          .update(post)
          .set({
            commentCount: sql`${post.commentCount} + 1`,
          })
          .where(eq(post.id, postId));

        return c.superjson({ 
          comment: {
            ...finalComment,
            hasVoted: true,
          } 
        });
      }),

    // Update a comment
    update: privateProcedure
      .input(updateCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId, content } = input;
        const userId = ctx.session.user.id;

        // Check if comment exists and user is author
        const [existingComment] = await ctx.db
          .select()
          .from(comment)
          .where(eq(comment.id, commentId))
          .limit(1);

        if (!existingComment) {
          throw new HTTPException(404, { message: "Comment not found" });
        }

        if (existingComment.authorId !== userId) {
          throw new HTTPException(403, {
            message: "You can only edit your own comments",
          });
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
          .returning();

        return c.superjson({ comment: updatedComment });
      }),

    // Delete a comment
    delete: privateProcedure
      .input(deleteCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId } = input;
        const userId = ctx.session.user.id;

        // Check if comment exists and get post/workspace info
        const [existingComment] = await ctx.db
          .select({
            id: comment.id,
            authorId: comment.authorId,
            postId: comment.postId,
          })
          .from(comment)
          .where(eq(comment.id, commentId))
          .limit(1);

        if (!existingComment) {
          throw new HTTPException(404, { message: "Comment not found" });
        }

        // Check if user is comment author
        const isAuthor = existingComment.authorId === userId;

        // Check if user is workspace owner
        let isWorkspaceOwner = false;
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
            .limit(1);

          if (postInfo) {
            isWorkspaceOwner = postInfo.ownerId === userId;
          }
        }

        if (!isAuthor && !isWorkspaceOwner) {
          throw new HTTPException(403, {
            message:
              "You can only delete your own comments or be the workspace owner",
          });
        }

        // Soft delete - set status to deleted
        await ctx.db
          .update(comment)
          .set({
            status: "deleted",
            content: "[deleted]",
          })
          .where(eq(comment.id, commentId));

        // Update post comment count
        await ctx.db
          .update(post)
          .set({
            commentCount: sql`greatest(0, ${post.commentCount} - 1)`,
          })
          .where(eq(post.id, existingComment.postId));

        // Update parent reply count if this was a reply
        if (existingComment.parentId) {
          await ctx.db
            .update(comment)
            .set({
              replyCount: sql`greatest(0, ${comment.replyCount} - 1)`,
            })
            .where(eq(comment.id, existingComment.parentId));
        }

        return c.superjson({ success: true });
      }),

    // Upvote/unvote a comment
    upvote: publicProcedure
      .input(upvoteCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId, fingerprint } = input;

        let userId: string | null = null;
        try {
          const session = await auth.api.getSession({
            headers: (c as any)?.req?.raw?.headers || (await headers()),
          });
          if (session?.user?.id) {
            userId = session.user.id;
          }
        } catch {
          // User is not authenticated
        }

        // Get IP address for anonymous tracking
        const forwardedFor = (c as any)?.req?.header("x-forwarded-for");
        const ipAddress = forwardedFor
          ? forwardedFor.split(",")[0]
          : "127.0.0.1";

        // Check if comment exists
        const [targetComment] = await ctx.db
          .select({ id: comment.id })
          .from(comment)
          .where(eq(comment.id, commentId))
          .limit(1);

        if (!targetComment) {
          throw new HTTPException(404, { message: "Comment not found" });
        }

        // Check if user already upvoted
        let existingReaction;

        if (userId) {
          [existingReaction] = await ctx.db
            .select()
            .from(commentReaction)
            .where(
              and(
                eq(commentReaction.commentId, commentId),
                eq(commentReaction.userId, userId),
                eq(commentReaction.type, "like")
              )
            )
            .limit(1);
        } else {
          // Check by fingerprint or IP for anonymous users
          // Prioritize fingerprint if available
          if (fingerprint) {
            [existingReaction] = await ctx.db
              .select()
              .from(commentReaction)
              .where(
                and(
                  eq(commentReaction.commentId, commentId),
                  isNull(commentReaction.userId),
                  eq(commentReaction.fingerprint, fingerprint),
                  eq(commentReaction.type, "like")
                )
              )
              .limit(1);
          }

          // If no fingerprint match (or no fingerprint provided), check IP
          // But only if we didn't find one by fingerprint already
          if (!existingReaction) {
            [existingReaction] = await ctx.db
              .select()
              .from(commentReaction)
              .where(
                and(
                  eq(commentReaction.commentId, commentId),
                  isNull(commentReaction.userId),
                  eq(commentReaction.ipAddress, ipAddress),
                  // If we are checking by IP, we should ideally ensure the record DOES NOT have a fingerprint
                  // to avoid mixing fingerprint users with non-fingerprint users on same IP.
                  // However, for simplicity and migration, we just check IP matching.
                  // A stricter check would be: isNull(commentReaction.fingerprint) if the client sends fingerprints now.
                  eq(commentReaction.type, "like")
                )
              )
              .limit(1);
          }
        }

        if (existingReaction) {
          // Remove upvote
          await ctx.db
            .delete(commentReaction)
            .where(eq(commentReaction.id, existingReaction.id));

          const [updatedComment] = await ctx.db
            .update(comment)
            .set({
              upvotes: sql`greatest(0, ${comment.upvotes} - 1)`,
            })
            .where(eq(comment.id, commentId))
            .returning({ upvotes: comment.upvotes });

          return c.superjson({
            upvotes: updatedComment?.upvotes || 0,
            hasVoted: false,
          });
        } else {
          // Add upvote
          await ctx.db.insert(commentReaction).values({
            commentId,
            userId: userId || null,
            ipAddress: userId ? null : ipAddress,
            fingerprint: userId ? null : fingerprint || null,
            type: "like",
          });

          const [updatedComment] = await ctx.db
            .update(comment)
            .set({
              upvotes: sql`${comment.upvotes} + 1`,
            })
            .where(eq(comment.id, commentId))
            .returning({ upvotes: comment.upvotes });

          return c.superjson({
            upvotes: updatedComment?.upvotes || 0,
            hasVoted: true,
          });
        }
      }),

    // Report a comment
    report: privateProcedure
      .input(reportCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId, reason, description } = input;
        const userId = ctx.session.user.id;

        // Check if comment exists
        const [targetComment] = await ctx.db
          .select({ id: comment.id })
          .from(comment)
          .where(eq(comment.id, commentId))
          .limit(1);

        if (!targetComment) {
          throw new HTTPException(404, { message: "Comment not found" });
        }

        // Create report
        await ctx.db.insert(commentReport).values({
          commentId,
          reportedBy: userId,
          reason,
          description: description || null,
          status: "pending",
        });

        return c.superjson({ success: true });
      }),

    // Pin or unpin a comment (workspace owner only)
    pin: privateProcedure
      .input(pinCommentInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { commentId, isPinned } = input;
        const userId = ctx.session.user.id;

        // Load comment and associated workspace owner
        const [target] = await ctx.db
          .select({
            id: comment.id,
            postId: post.id,
            workspaceOwnerId: workspace.ownerId,
          })
          .from(comment)
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .innerJoin(workspace, eq(board.workspaceId, workspace.id))
          .where(eq(comment.id, commentId))
          .limit(1);

        if (!target) {
          throw new HTTPException(404, { message: "Comment not found" });
        }

        // Check owner rights
        const isWorkspaceOwner = target.workspaceOwnerId === userId;
        if (!isWorkspaceOwner) {
          throw new HTTPException(403, {
            message: "Only the workspace owner can pin comments",
          });
        }

        const [updated] = await ctx.db
          .update(comment)
          .set({
            isPinned,
            moderatedBy: userId,
            moderatedAt: new Date(),
          })
          .where(eq(comment.id, commentId))
          .returning({ id: comment.id, isPinned: comment.isPinned });

        return c.superjson({
          id: updated?.id,
          isPinned: updated?.isPinned || false,
        });
      }),

    // List mention notifications for current user
    mentionsList: privateProcedure
      .input(mentionsListInputSchema.optional())
      .get(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id;
        const limit = Math.min(Math.max(Number(input?.limit || 50), 1), 100);
        const rows = await ctx.db
          .select({
            id: commentMention.id,
            isRead: commentMention.isRead,
            createdAt: commentMention.createdAt,
            commentId: comment.id,
            commentContent: comment.content,
            postSlug: post.slug,
            postTitle: post.title,
            workspaceSlug: workspace.slug,
            authorName: comment.authorName,
            authorImage: user.image,
          })
          .from(commentMention)
          .innerJoin(comment, eq(commentMention.commentId, comment.id))
          .innerJoin(user, eq(comment.authorId, user.id))
          .innerJoin(post, eq(comment.postId, post.id))
          .innerJoin(board, eq(post.boardId, board.id))
          .innerJoin(workspace, eq(board.workspaceId, workspace.id))
          .where(eq(commentMention.mentionedUserId, userId))
          .orderBy(desc(commentMention.createdAt))
          .limit(limit);
        return c.superjson({ notifications: rows });
      }),

    // Count unread mention notifications
    mentionsCount: privateProcedure.get(async ({ ctx, c }) => {
      const userId = ctx.session.user.id;
      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(commentMention)
        .where(
          and(
            eq(commentMention.mentionedUserId, userId),
            eq(commentMention.isRead, false)
          )
        );
      return c.superjson({ unread: Number(count || 0) });
    }),

    // Mark a mention notification as read
    mentionsMarkRead: privateProcedure
      .input(mentionsMarkReadInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id;
        const { id } = input;
        await ctx.db
          .update(commentMention)
          .set({ isRead: true })
          .where(
            and(
              eq(commentMention.id, id),
              eq(commentMention.mentionedUserId, userId)
            )
          );
        return c.superjson({ success: true });
      }),

    // Mark all mention notifications as read for current user
    mentionsMarkAllRead: privateProcedure.post(async ({ ctx, c }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .update(commentMention)
        .set({ isRead: true })
        .where(
          and(
            eq(commentMention.mentionedUserId, userId),
            eq(commentMention.isRead, false)
          )
        );
      return c.superjson({ success: true });
    }),
  });
}
