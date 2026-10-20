import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { commentEmojiReaction, type db } from "@featul/db";
import { HTTPException } from "hono/http-exception";
import { requireCommentAccess } from "./access";
import type { EmojiReaction } from "../shared/reactions";

type Actor = { userId: string | null; fingerprint: string | null };

function actorFilter(actor: Actor) {
  return actor.userId
    ? eq(commentEmojiReaction.userId, actor.userId)
    : and(
        isNull(commentEmojiReaction.userId),
        eq(commentEmojiReaction.fingerprint, actor.fingerprint || ""),
      )!;
}

/** Call with only comments already authorized for this viewer. No actor IDs leave the API. */
export async function listCommentReactions(
  database: typeof db,
  commentIds: string[],
  actor: Actor,
) {
  const grouped = new Map<string, EmojiReaction[]>();
  if (!commentIds.length) return grouped;
  const rows = await database
    .select({
      commentId: commentEmojiReaction.commentId,
      emoji: commentEmojiReaction.emoji,
      count: sql<number>`count(*)::int`,
      reacted: sql<boolean>`bool_or(${actorFilter(actor)})`,
    })
    .from(commentEmojiReaction)
    .where(inArray(commentEmojiReaction.commentId, commentIds))
    .groupBy(commentEmojiReaction.commentId, commentEmojiReaction.emoji)
    .orderBy(asc(commentEmojiReaction.emoji));
  for (const row of rows) {
    const reactions = grouped.get(row.commentId) || [];
    reactions.push({
      emoji: row.emoji,
      count: Number(row.count),
      reacted: Boolean(row.reacted),
    });
    grouped.set(row.commentId, reactions);
  }
  return grouped;
}

export async function setCommentReaction(
  database: typeof db,
  input: { commentId: string; emoji: string; active: boolean },
  actor: Actor,
) {
  const access = await requireCommentAccess(
    database,
    input.commentId,
    actor.userId,
  );
  if (access.isLocked)
    throw new HTTPException(403, { message: "This post is locked" });
  if (!access.allowComments)
    throw new HTTPException(403, {
      message: "Comments are disabled for this board",
    });
  if (!actor.userId && !actor.fingerprint)
    throw new HTTPException(401, {
      message: "Unable to identify this visitor",
    });

  if (input.active) {
    // Desired-state writes plus unique indexes make retries and double clicks safe.
    await database
      .insert(commentEmojiReaction)
      .values({
        commentId: input.commentId,
        emoji: input.emoji,
        userId: actor.userId,
        fingerprint: actor.userId ? null : actor.fingerprint,
      })
      .onConflictDoNothing();
  } else {
    await database
      .delete(commentEmojiReaction)
      .where(
        and(
          eq(commentEmojiReaction.commentId, input.commentId),
          eq(commentEmojiReaction.emoji, input.emoji),
          actorFilter(actor),
        ),
      );
  }

  const reactions = await listCommentReactions(
    database,
    [input.commentId],
    actor,
  );
  return { reactions: reactions.get(input.commentId) || [] };
}
