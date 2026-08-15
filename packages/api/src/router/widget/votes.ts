import { and, eq, isNull, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { board, comment, commentReaction, post } from "@featul/db";
import { vote } from "@featul/db";
import { publicProcedure } from "../../jstack";
import { getRequestFingerprint } from "../../shared/request-fingerprint";
import { getWidgetRequest, resolveAuthorId, resolveWidget } from "./resolve";
import { voteCommentSchema, voteSchema } from "./schema";

export const widgetVote = publicProcedure
  .input(voteSchema)
  .post(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(
      ctx,
      input.projectId,
      input.parentOrigin,
    );

    const [targetPost] = await ctx.db
      .select({ id: post.id })
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

    const voterId = await resolveAuthorId(
      ctx,
      input,
      resolved.workspaceId,
      resolved.widgetSecret,
    );

    const request = getWidgetRequest(c);
    const fingerprint = voterId
      ? null
      : getRequestFingerprint(request, input.fingerprint);
    const anonymousFingerprint = fingerprint || "";
    const existingWhere = voterId
      ? and(eq(vote.postId, input.postId), eq(vote.widgetUserId, voterId))
      : and(
          eq(vote.postId, input.postId),
          isNull(vote.userId),
          eq(vote.fingerprint, anonymousFingerprint),
        );

    const [existing] = await ctx.db
      .select({ id: vote.id })
      .from(vote)
      .where(existingWhere)
      .limit(1);
    if (existing) {
      await ctx.db.delete(vote).where(eq(vote.id, existing.id));
      const [updated] = await ctx.db
        .update(post)
        .set({ upvotes: sql`greatest(0, ${post.upvotes} - 1)` })
        .where(eq(post.id, input.postId))
        .returning({ upvotes: post.upvotes });
      return c.superjson({ hasVoted: false, upvotes: updated?.upvotes || 0 });
    }

    await ctx.db.insert(vote).values({
      postId: input.postId,
      widgetUserId: voterId,
      fingerprint,
      type: "upvote",
    });
    const [updated] = await ctx.db
      .update(post)
      .set({ upvotes: sql`${post.upvotes} + 1` })
      .where(eq(post.id, input.postId))
      .returning({ upvotes: post.upvotes });
    return c.superjson({ hasVoted: true, upvotes: updated?.upvotes || 0 });
  });

export const widgetVoteComment = publicProcedure
  .input(voteCommentSchema)
  .post(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(
      ctx,
      input.projectId,
      input.parentOrigin,
    );
    const request = getWidgetRequest(c);

    const [target] = await ctx.db
      .select({
        id: comment.id,
        upvotes: comment.upvotes,
      })
      .from(comment)
      .innerJoin(post, eq(comment.postId, post.id))
      .innerJoin(board, eq(post.boardId, board.id))
      .where(
        and(
          eq(comment.id, input.commentId),
          eq(comment.status, "published"),
          eq(comment.isInternal, false),
          eq(board.workspaceId, resolved.workspaceId),
          eq(board.isPublic, true),
        ),
      )
      .limit(1);

    if (!target) throw new HTTPException(404, { message: "Comment not found" });

    const voterId = await resolveAuthorId(
      ctx,
      input,
      resolved.workspaceId,
      resolved.widgetSecret,
    );

    const fingerprint = voterId
      ? null
      : getRequestFingerprint(request, input.fingerprint);
    const anonymousFingerprint = fingerprint || "";
    const existingWhere = voterId
      ? and(
          eq(commentReaction.commentId, input.commentId),
          eq(commentReaction.widgetUserId, voterId),
          eq(commentReaction.type, "upvote"),
        )
      : and(
          eq(commentReaction.commentId, input.commentId),
          isNull(commentReaction.userId),
          eq(commentReaction.fingerprint, anonymousFingerprint),
          eq(commentReaction.type, "upvote"),
        );

    const [existing] = await ctx.db
      .select({ id: commentReaction.id })
      .from(commentReaction)
      .where(existingWhere)
      .limit(1);

    if (existing) {
      await ctx.db
        .delete(commentReaction)
        .where(eq(commentReaction.id, existing.id));
      const [updated] = await ctx.db
        .update(comment)
        .set({ upvotes: sql`greatest(0, ${comment.upvotes} - 1)` })
        .where(eq(comment.id, input.commentId))
        .returning({ upvotes: comment.upvotes });
      return c.superjson({ hasVoted: false, upvotes: updated?.upvotes || 0 });
    }

    await ctx.db.insert(commentReaction).values({
      commentId: input.commentId,
      widgetUserId: voterId,
      fingerprint,
      type: "upvote",
    });
    const [updated] = await ctx.db
      .update(comment)
      .set({ upvotes: sql`${comment.upvotes} + 1` })
      .where(eq(comment.id, input.commentId))
      .returning({ upvotes: comment.upvotes });
    return c.superjson({ hasVoted: true, upvotes: updated?.upvotes || 0 });
  });
