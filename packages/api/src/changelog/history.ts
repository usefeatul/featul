import { and, asc, desc, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { board, changelogAiConversation, changelogEntry } from "@featul/db";
import { privateProcedure } from "../jstack";
import { requireBoardManagerBySlug } from "../shared/access";
import {
  aiConversationDeleteSchema,
  aiConversationGetSchema,
  aiConversationSaveSchema,
  aiConversationsListSchema,
} from "../validators/changelog";

const MAX_CONVERSATIONS_PER_USER = 50;

async function getChangelogBoard(ctx: any, slug: string) {
  const workspace = await requireBoardManagerBySlug(ctx, slug);
  const [changelogBoard] = await ctx.db
    .select({ id: board.id })
    .from(board)
    .where(
      and(
        eq(board.workspaceId, workspace.id),
        eq(board.systemType, "changelog"),
      ),
    )
    .limit(1);

  if (!changelogBoard) {
    throw new HTTPException(404, { message: "Changelog board not found" });
  }

  return changelogBoard;
}

async function assertEntryBelongsToBoard(
  ctx: any,
  boardId: string,
  entryId?: string | null,
) {
  if (!entryId) return;

  const [entry] = await ctx.db
    .select({ id: changelogEntry.id })
    .from(changelogEntry)
    .where(
      and(eq(changelogEntry.id, entryId), eq(changelogEntry.boardId, boardId)),
    )
    .limit(1);

  if (!entry) {
    throw new HTTPException(404, { message: "Changelog entry not found" });
  }
}

function toSummary(conversation: typeof changelogAiConversation.$inferSelect) {
  return {
    id: conversation.id,
    entryId: conversation.entryId,
    title: conversation.title,
    messageCount: Array.isArray(conversation.messages)
      ? conversation.messages.length
      : 0,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export function createChangelogHistoryProcedures() {
  return {
    aiConversationsList: privateProcedure
      .input(aiConversationsListSchema)
      .get(async ({ ctx, input, c }) => {
        const changelogBoard = await getChangelogBoard(ctx, input.slug);
        const conversations = await ctx.db
          .select()
          .from(changelogAiConversation)
          .where(
            and(
              eq(changelogAiConversation.boardId, changelogBoard.id),
              eq(changelogAiConversation.userId, ctx.session.user.id),
            ),
          )
          .orderBy(desc(changelogAiConversation.updatedAt))
          .limit(input.limit ?? 50);

        return c.superjson({
          ok: true,
          conversations: conversations.map(toSummary),
        });
      }),

    aiConversationGet: privateProcedure
      .input(aiConversationGetSchema)
      .get(async ({ ctx, input, c }) => {
        const changelogBoard = await getChangelogBoard(ctx, input.slug);
        const [conversation] = await ctx.db
          .select()
          .from(changelogAiConversation)
          .where(
            and(
              eq(changelogAiConversation.id, input.conversationId),
              eq(changelogAiConversation.boardId, changelogBoard.id),
              eq(changelogAiConversation.userId, ctx.session.user.id),
            ),
          )
          .limit(1);

        if (!conversation) {
          throw new HTTPException(404, {
            message: "Conversation not found",
          });
        }

        return c.superjson({ ok: true, conversation });
      }),

    aiConversationSave: privateProcedure
      .input(aiConversationSaveSchema)
      .post(async ({ ctx, input, c }) => {
        const changelogBoard = await getChangelogBoard(ctx, input.slug);
        await assertEntryBelongsToBoard(ctx, changelogBoard.id, input.entryId);

        if (input.conversationId) {
          const [existing] = await ctx.db
            .select()
            .from(changelogAiConversation)
            .where(
              and(
                eq(changelogAiConversation.id, input.conversationId),
                eq(changelogAiConversation.boardId, changelogBoard.id),
                eq(changelogAiConversation.userId, ctx.session.user.id),
              ),
            )
            .limit(1);

          if (!existing) {
            throw new HTTPException(404, {
              message: "Conversation not found",
            });
          }

          const [conversation] = await ctx.db
            .update(changelogAiConversation)
            .set({
              entryId:
                input.entryId === undefined ? existing.entryId : input.entryId,
              title: input.title.trim(),
              messages: input.messages,
              selectedPostIds: input.selectedPostIds,
              pendingTagNames: input.pendingTagNames,
              updatedAt: new Date(),
            })
            .where(eq(changelogAiConversation.id, existing.id))
            .returning();

          return c.superjson({
            ok: true,
            conversation,
            summary: toSummary(conversation),
          });
        }

        const [countResult] = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(changelogAiConversation)
          .where(
            and(
              eq(changelogAiConversation.boardId, changelogBoard.id),
              eq(changelogAiConversation.userId, ctx.session.user.id),
            ),
          );

        if ((countResult?.count ?? 0) >= MAX_CONVERSATIONS_PER_USER) {
          const [oldest] = await ctx.db
            .select({ id: changelogAiConversation.id })
            .from(changelogAiConversation)
            .where(
              and(
                eq(changelogAiConversation.boardId, changelogBoard.id),
                eq(changelogAiConversation.userId, ctx.session.user.id),
              ),
            )
            .orderBy(asc(changelogAiConversation.updatedAt))
            .limit(1);

          if (oldest) {
            await ctx.db
              .delete(changelogAiConversation)
              .where(eq(changelogAiConversation.id, oldest.id));
          }
        }

        const [conversation] = await ctx.db
          .insert(changelogAiConversation)
          .values({
            boardId: changelogBoard.id,
            entryId: input.entryId ?? null,
            userId: ctx.session.user.id,
            title: input.title.trim(),
            messages: input.messages,
            selectedPostIds: input.selectedPostIds,
            pendingTagNames: input.pendingTagNames,
          })
          .returning();

        return c.superjson({
          ok: true,
          conversation,
          summary: toSummary(conversation),
        });
      }),

    aiConversationDelete: privateProcedure
      .input(aiConversationDeleteSchema)
      .post(async ({ ctx, input, c }) => {
        const changelogBoard = await getChangelogBoard(ctx, input.slug);
        const [deleted] = await ctx.db
          .delete(changelogAiConversation)
          .where(
            and(
              eq(changelogAiConversation.id, input.conversationId),
              eq(changelogAiConversation.boardId, changelogBoard.id),
              eq(changelogAiConversation.userId, ctx.session.user.id),
            ),
          )
          .returning({ id: changelogAiConversation.id });

        if (!deleted) {
          throw new HTTPException(404, {
            message: "Conversation not found",
          });
        }

        return c.superjson({ ok: true });
      }),
  };
}
