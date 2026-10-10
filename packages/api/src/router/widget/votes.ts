import { togglePostVote, toggleCommentVote } from "../../post/voting";
import { publicBoardConditions } from "../../post/access";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { board, comment, post } from "@featul/db";
import { publicProcedure } from "../../jstack";
import { getRequestFingerprint } from "../../request/fingerprint";
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
          eq(post.status, "published"),
          eq(board.workspaceId, resolved.workspaceId),
          publicBoardConditions(),
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
    return c.superjson(await togglePostVote(ctx.db, input.postId, { widgetUserId: voterId, fingerprint }));
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
          eq(post.status, "published"),
          eq(board.workspaceId, resolved.workspaceId),
          publicBoardConditions(),
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
    const result = await toggleCommentVote(ctx.db, input.commentId, "upvote", { widgetUserId: voterId, fingerprint });
    return c.superjson({ upvotes: result.upvotes, hasVoted: result.userVote === "upvote" });
  });
