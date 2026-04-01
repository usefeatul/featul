import { and, desc, eq, sql } from "drizzle-orm";
import { privateProcedure } from "../jstack";
import {
  board,
  changelogEntry,
  changelogMention,
  comment,
  commentMention,
  post,
  user,
  workspace,
} from "@featul/db";
import {
  mentionsListInputSchema,
  mentionsMarkReadInputSchema,
} from "../validators/comment";

export function createCommentMentionProcedures() {
  return {
    mentionsList: privateProcedure
      .input(mentionsListInputSchema.optional())
      .get(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id;
        const limit = Math.min(Math.max(Number(input?.limit || 50), 1), 100);

        const commentRows: Array<{
          id: string;
          isRead: boolean;
          createdAt: Date;
          postSlug: string;
          postTitle: string;
          authorName: string;
          authorImage: string | null;
        }> = await ctx.db
          .select({
            id: commentMention.id,
            isRead: commentMention.isRead,
            createdAt: commentMention.createdAt,
            postSlug: post.slug,
            postTitle: post.title,
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

        const changelogRows: Array<{
          id: string;
          isRead: boolean;
          createdAt: Date;
          entrySlug: string;
          entryTitle: string;
          authorName: string;
          authorImage: string | null;
        }> = await ctx.db
          .select({
            id: changelogMention.id,
            isRead: changelogMention.isRead,
            createdAt: changelogMention.createdAt,
            entrySlug: changelogEntry.slug,
            entryTitle: changelogEntry.title,
            authorName: user.name,
            authorImage: user.image,
          })
          .from(changelogMention)
          .innerJoin(changelogEntry, eq(changelogMention.entryId, changelogEntry.id))
          .innerJoin(user, eq(changelogMention.mentionedBy, user.id))
          .where(eq(changelogMention.mentionedUserId, userId))
          .orderBy(desc(changelogMention.createdAt))
          .limit(limit);

        const notifications = [
          ...commentRows.map((row) => ({
            id: `comment:${row.id}`,
            type: "feedback" as const,
            isRead: row.isRead,
            createdAt: row.createdAt,
            path: `/board/p/${row.postSlug}`,
            postSlug: row.postSlug,
            postTitle: row.postTitle,
            authorName: row.authorName,
            authorImage: row.authorImage,
          })),
          ...changelogRows.map((row) => ({
            id: `changelog:${row.id}`,
            type: "changelog" as const,
            isRead: row.isRead,
            createdAt: row.createdAt,
            path: `/changelog/p/${row.entrySlug}`,
            entrySlug: row.entrySlug,
            entryTitle: row.entryTitle,
            authorName: row.authorName,
            authorImage: row.authorImage,
          })),
        ]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, limit);

        return c.superjson({ notifications });
      }),

    mentionsCount: privateProcedure.get(async ({ ctx, c }) => {
      const userId = ctx.session.user.id;
      const [commentUnread] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(commentMention)
        .where(
          and(
            eq(commentMention.mentionedUserId, userId),
            eq(commentMention.isRead, false),
          ),
        );

      const [changelogUnread] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(changelogMention)
        .where(
          and(
            eq(changelogMention.mentionedUserId, userId),
            eq(changelogMention.isRead, false),
          ),
        );

      const unread =
        Number(commentUnread?.count || 0) + Number(changelogUnread?.count || 0);
      return c.superjson({ unread });
    }),

    mentionsMarkRead: privateProcedure
      .input(mentionsMarkReadInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id;
        const rawId = input.id;
        const [prefix, parsedMentionId] = rawId.split(":", 2);
        const kind = parsedMentionId ? prefix : "comment";
        const mentionId = parsedMentionId ?? rawId;

        if (kind === "changelog") {
          await ctx.db
            .update(changelogMention)
            .set({ isRead: true })
            .where(
              and(
                eq(changelogMention.id, mentionId),
                eq(changelogMention.mentionedUserId, userId),
              ),
            );
        } else if (kind === "comment") {
          await ctx.db
            .update(commentMention)
            .set({ isRead: true })
            .where(
              and(
                eq(commentMention.id, mentionId),
                eq(commentMention.mentionedUserId, userId),
              ),
            );
        } else {
          await ctx.db
            .update(commentMention)
            .set({ isRead: true })
            .where(
              and(
                eq(commentMention.id, mentionId),
                eq(commentMention.mentionedUserId, userId),
              ),
            );
          await ctx.db
            .update(changelogMention)
            .set({ isRead: true })
            .where(
              and(
                eq(changelogMention.id, mentionId),
                eq(changelogMention.mentionedUserId, userId),
              ),
            );
        }

        return c.superjson({ success: true });
      }),

    mentionsMarkAllRead: privateProcedure.post(async ({ ctx, c }) => {
      const userId = ctx.session.user.id;
      await ctx.db
        .update(commentMention)
        .set({ isRead: true })
        .where(
          and(
            eq(commentMention.mentionedUserId, userId),
            eq(commentMention.isRead, false),
          ),
        );
      await ctx.db
        .update(changelogMention)
        .set({ isRead: true })
        .where(
          and(
            eq(changelogMention.mentionedUserId, userId),
            eq(changelogMention.isRead, false),
          ),
        );
      return c.superjson({ success: true });
    }),
  };
}
