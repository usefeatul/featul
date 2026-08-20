import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  board,
  comment,
  commentReaction,
  post,
  user,
  widgetUser,
} from "@featul/db";
import { publicProcedure } from "../../jstack";
import { getRequestFingerprint } from "../../request/fingerprint";
import {
  assertWidgetPostImageUrl,
  resolveAuthorId,
  resolveViewerId,
  resolveWidget,
  resolveWidgetCommentAuthorImage,
  getWidgetRequest,
} from "./resolve";
import { commentsSchema, createCommentSchema } from "./schema";

type CommentAttachment = {
  url?: string;
  type?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function commentAttachments(metadata: unknown): CommentAttachment[] {
  if (!isRecord(metadata) || !Array.isArray(metadata.attachments)) return [];
  return metadata.attachments.flatMap((item) => {
    if (!isRecord(item)) return [];
    return [
      {
        url: typeof item.url === "string" ? item.url : undefined,
        type: typeof item.type === "string" ? item.type : undefined,
      },
    ];
  });
}

function firstCommentImage(
  metadata: unknown,
  fallback?: string | null,
): string | null {
  const attachments = commentAttachments(metadata);
  const image =
    attachments.find(
      (item) => item.type?.startsWith("image") || Boolean(item.url),
    )?.url || null;
  return image || fallback || null;
}

export const widgetComments = publicProcedure
  .input(commentsSchema)
  .get(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(
      ctx,
      input.projectId,
      input.parentOrigin,
    );
    const request = getWidgetRequest(c);
    const viewerId = await resolveViewerId(
      ctx,
      input,
      resolved.workspaceId,
      resolved.widgetSecret,
    );
    const fingerprint = viewerId
      ? null
      : getRequestFingerprint(request, input.fingerprint);

    const [targetPost] = await ctx.db
      .select({
        id: post.id,
        allowComments: board.allowComments,
      })
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .where(
        and(
          eq(post.id, input.postId),
          eq(board.workspaceId, resolved.workspaceId),
          eq(board.isPublic, true),
        ),
      )
      .limit(1);

    if (!targetPost)
      throw new HTTPException(404, { message: "Post not found" });

    const rows = await ctx.db
      .select({
        id: comment.id,
        postId: comment.postId,
        parentId: comment.parentId,
        content: comment.content,
        authorName: comment.authorName,
        authorImage: sql<
          string | null
        >`coalesce(${widgetUser.image}, ${user.image})`,
        isAnonymous: comment.isAnonymous,
        upvotes: comment.upvotes,
        replyCount: comment.replyCount,
        depth: comment.depth,
        createdAt: comment.createdAt,
        metadata: comment.metadata,
      })
      .from(comment)
      .leftJoin(user, eq(comment.authorId, user.id))
      .leftJoin(widgetUser, eq(comment.widgetUserId, widgetUser.id))
      .where(
        and(
          eq(comment.postId, input.postId),
          eq(comment.status, "published"),
          eq(comment.isInternal, false),
        ),
      )
      .orderBy(asc(comment.createdAt));

    const commentIds = rows.map((row: { id: string }) => row.id);
    const votedIds = new Set<string>();
    if (commentIds.length && (viewerId || fingerprint)) {
      const reactionFilter = viewerId
        ? and(
            inArray(commentReaction.commentId, commentIds),
            eq(commentReaction.widgetUserId, viewerId),
            eq(commentReaction.type, "upvote"),
          )
        : and(
            inArray(commentReaction.commentId, commentIds),
            isNull(commentReaction.userId),
            eq(commentReaction.fingerprint, fingerprint || ""),
            eq(commentReaction.type, "upvote"),
          );
      const reactions = await ctx.db
        .select({ commentId: commentReaction.commentId })
        .from(commentReaction)
        .where(reactionFilter);
      for (const row of reactions) votedIds.add(row.commentId);
    }

    return c.superjson({
      allowComments: Boolean(targetPost.allowComments),
      comments: rows.map((row: (typeof rows)[number]) => {
        const image = firstCommentImage(row.metadata);
        return {
          id: row.id,
          postId: row.postId,
          parentId: row.parentId,
          content: (row.content || "").trim(),
          image,
          authorName: row.isAnonymous ? "Guest" : row.authorName || "Guest",
          authorImage: resolveWidgetCommentAuthorImage(row),
          isAnonymous: Boolean(row.isAnonymous),
          upvotes: row.upvotes || 0,
          replyCount: row.replyCount || 0,
          depth: row.depth || 0,
          createdAt: row.createdAt,
          hasVoted: votedIds.has(row.id),
        };
      }),
    });
  });

export const widgetCreateComment = publicProcedure
  .input(createCommentSchema)
  .post(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(
      ctx,
      input.projectId,
      input.parentOrigin,
    );
    const request = getWidgetRequest(c);

    const [targetPost] = await ctx.db
      .select({
        id: post.id,
        isLocked: post.isLocked,
        allowComments: board.allowComments,
        allowAnonymous: board.allowAnonymous,
      })
      .from(post)
      .innerJoin(board, eq(post.boardId, board.id))
      .where(
        and(
          eq(post.id, input.postId),
          eq(board.workspaceId, resolved.workspaceId),
          eq(board.isPublic, true),
        ),
      )
      .limit(1);

    if (!targetPost)
      throw new HTTPException(404, { message: "Post not found" });
    if (!targetPost.allowComments) {
      throw new HTTPException(403, {
        message: "Comments are disabled on this board",
      });
    }
    if (targetPost.isLocked) {
      throw new HTTPException(403, { message: "This post is locked" });
    }

    const authorId = await resolveAuthorId(
      ctx,
      input,
      resolved.workspaceId,
      resolved.widgetSecret,
    );
    const [identifiedAuthor] = authorId
      ? await ctx.db
          .select({
            name: widgetUser.name,
            email: widgetUser.email,
            image: widgetUser.image,
          })
          .from(widgetUser)
          .where(eq(widgetUser.id, authorId))
          .limit(1)
      : [];
    const authorName =
      identifiedAuthor?.name || identifiedAuthor?.email || "Guest";
    const authorImage = identifiedAuthor?.image || null;

    if (
      !authorId &&
      (!resolved.config.allowGuestPosting || !targetPost.allowAnonymous)
    ) {
      throw new HTTPException(401, { message: "Sign in to comment" });
    }

    const fingerprint = authorId
      ? null
      : getRequestFingerprint(request, input.fingerprint);
    if (!authorId && !fingerprint) {
      throw new HTTPException(400, { message: "Missing visitor fingerprint" });
    }

    let depth = 0;
    if (input.parentId) {
      const [parentComment] = await ctx.db
        .select({
          id: comment.id,
          depth: comment.depth,
          postId: comment.postId,
          isInternal: comment.isInternal,
        })
        .from(comment)
        .where(eq(comment.id, input.parentId))
        .limit(1);

      if (!parentComment || parentComment.postId !== input.postId) {
        throw new HTTPException(404, { message: "Parent comment not found" });
      }
      if (parentComment.isInternal) {
        throw new HTTPException(403, {
          message: "Cannot reply to this comment",
        });
      }
      depth = (parentComment.depth || 0) + 1;
      await ctx.db
        .update(comment)
        .set({ replyCount: sql`${comment.replyCount} + 1` })
        .where(eq(comment.id, input.parentId));
    }

    const content = input.content.trim();
    const metadata: {
      fingerprint?: string;
      attachments?: { name: string; url: string; type: string }[];
    } = {};
    if (fingerprint) metadata.fingerprint = fingerprint;
    if (input.image) {
      assertWidgetPostImageUrl(input.image, resolved.workspaceSlug);
      metadata.attachments = [
        {
          name: "image",
          url: input.image,
          type: "image",
        },
      ];
    }

    const [created] = await ctx.db
      .insert(comment)
      .values({
        postId: input.postId,
        parentId: input.parentId || null,
        content: content || (input.image ? " " : ""),
        widgetUserId: authorId,
        authorName: authorId ? authorName : "Guest",
        depth,
        status: "published",
        isInternal: false,
        isAnonymous: !authorId,
        metadata: Object.keys(metadata).length ? metadata : null,
        upvotes: 1,
      })
      .returning();

    await ctx.db.insert(commentReaction).values({
      commentId: created.id,
      widgetUserId: authorId,
      fingerprint: authorId ? null : fingerprint,
      type: "upvote",
    });

    const [updatedPost] = await ctx.db
      .update(post)
      .set({ commentCount: sql`${post.commentCount} + 1` })
      .where(eq(post.id, input.postId))
      .returning({ commentCount: post.commentCount });

    const image = firstCommentImage(created.metadata, input.image);

    return c.superjson({
      comment: {
        id: created.id,
        postId: created.postId,
        parentId: created.parentId,
        content: created.content?.trim() || "",
        image,
        authorName: created.isAnonymous
          ? "Guest"
          : created.authorName || "Guest",
        authorImage: resolveWidgetCommentAuthorImage({
          id: created.id,
          isAnonymous: created.isAnonymous,
          authorImage,
          authorName: created.authorName,
          metadata: created.metadata,
        }),
        isAnonymous: Boolean(created.isAnonymous),
        upvotes: 1,
        replyCount: 0,
        depth: created.depth || 0,
        createdAt: created.createdAt,
        hasVoted: true,
      },
      commentCount: updatedPost?.commentCount || 0,
    });
  });
