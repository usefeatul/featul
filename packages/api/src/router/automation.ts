import { and, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { privateProcedure } from "../jstack";
import {
  activityLog,
  board,
  changelogEntry,
} from "@featul/db";
import { getPlanLimits } from "../shared/plan";
import { getWorkspaceAccessPlan, requireBoardManagerBySlug } from "../shared/access";
import { ACTIVITY_ACTIONS } from "../activity/actions";
import {
  deleteNotraConnectionSchema,
  getNotraConnectionSchema,
  importNotraSchema,
  saveNotraConnectionSchema,
  aiSourcePostsListSchema,
} from "../validators/changelog";
import { fetchAiSourcePostsList } from "../ai";
import {
  deleteStoredNotraConnection,
  getStoredNotraConnection,
  NotraApiError,
  NotraImportRateLimitError,
  NotraStoredConnectionError,
  runNotraImport,
  storeNotraConnection,
} from "../notra/import";
import {
  canEncryptSecrets,
  SecretCryptoError,
} from "../crypto/secret";

async function getChangelogBoardId(
  db: { select: (...args: any[]) => any },
  workspaceId: string,
) {
  const [changelogBoard] = await db
    .select({ id: board.id })
    .from(board)
    .where(
      and(
        eq(board.workspaceId, workspaceId),
        eq(board.systemType, "changelog"),
      ),
    )
    .limit(1);

  if (!changelogBoard) {
    throw new HTTPException(404, { message: "Changelog board not found" });
  }

  return changelogBoard.id;
}

export function createChangelogAutomationProcedures() {
  return {
    aiSourcePostsList: privateProcedure
      .input(aiSourcePostsListSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const posts = await fetchAiSourcePostsList({
          db: ctx.db,
          workspaceId: ws.id,
          limit: input.limit,
        });

        return c.superjson({ ok: true, posts });
      }),

    notraConnectionGet: privateProcedure
      .input(getNotraConnectionSchema)
      .get(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const connection = await getStoredNotraConnection(ctx.db, ws.id);
        return c.superjson({
          connected: Boolean(connection),
          organizationId: connection?.organizationId || null,
          canStore: canEncryptSecrets(),
        });
      }),

    notraConnectionSave: privateProcedure
      .input(saveNotraConnectionSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        if (!canEncryptSecrets()) {
          throw new HTTPException(503, {
            message:
              "Credential encryption is not configured on this environment (missing NOTRA_CREDENTIALS_ENCRYPTION_KEY)",
          });
        }

        let saveMode: "created" | "updated";
        try {
          saveMode = await storeNotraConnection({
            db: ctx.db,
            workspaceId: ws.id,
            actorUserId: ctx.session.user.id,
            organizationId: input.organizationId,
            apiKey: input.apiKey,
          });
        } catch (error) {
          if (error instanceof SecretCryptoError) {
            throw new HTTPException(503, {
              message: "Credential encryption is not available",
            });
          }
          if (error instanceof NotraStoredConnectionError) {
            throw new HTTPException(400, { message: error.message });
          }
          throw error;
        }

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: ACTIVITY_ACTIONS.CHANGELOG_NOTRA_CONNECTION_SAVED,
          actionType: saveMode === "created" ? "create" : "update",
          entity: "workspace_notra_connection",
          entityId: String(ws.id),
          title: "Notra connection saved",
          metadata: {
            mode: saveMode,
          },
        });

        return c.superjson({ ok: true });
      }),

    notraConnectionDelete: privateProcedure
      .input(deleteNotraConnectionSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const deleted = await deleteStoredNotraConnection(ctx.db, ws.id);
        if (deleted) {
          await ctx.db.insert(activityLog).values({
            workspaceId: ws.id,
            userId: ctx.session.user.id,
            action: ACTIVITY_ACTIONS.CHANGELOG_NOTRA_CONNECTION_DELETED,
            actionType: "delete",
            entity: "workspace_notra_connection",
            entityId: String(ws.id),
            title: "Notra connection deleted",
            metadata: {},
          });
        }
        return c.superjson({ ok: true });
      }),

    importFromNotra: privateProcedure
      .input(importNotraSchema)
      .post(async ({ ctx, input, c }) => {
        const ws = await requireBoardManagerBySlug(ctx, input.slug);
        const changelogBoardId = await getChangelogBoardId(ctx.db, ws.id);

        const limits = getPlanLimits(await getWorkspaceAccessPlan(ws.id));
        const [countResult] = await ctx.db
          .select({ count: sql<number>`count(*)::int` })
          .from(changelogEntry)
          .where(eq(changelogEntry.boardId, changelogBoardId));

        const statuses = (
          input.status && input.status.length > 0
            ? Array.from(new Set(input.status))
            : ["published", "draft"]
        ) as Array<"draft" | "published">;
        const mode = input.mode ?? "upsert";
        const publishBehavior = input.publishBehavior ?? "draft_only";
        const recordImportFailure = async (reason: string) => {
          try {
            await ctx.db.insert(activityLog).values({
              workspaceId: ws.id,
              userId: ctx.session.user.id,
              action: ACTIVITY_ACTIONS.CHANGELOG_NOTRA_IMPORT_FAILED,
              actionType: "update",
              entity: "changelog_entry",
              entityId: String(changelogBoardId),
              title: "Notra import failed",
              metadata: {
                reason,
              },
            });
          } catch {
            // Swallow logging failures to preserve the main error response.
          }
        };

        let summary;
        try {
          summary = await runNotraImport({
            db: ctx.db,
            workspaceId: ws.id,
            boardId: changelogBoardId,
            actorUserId: ctx.session.user.id,
            maxChangelogEntries: limits.maxChangelogEntries,
            currentEntryCount: countResult?.count || 0,
            status: statuses,
            limit: input.limit ?? 50,
            maxPages: input.maxPages ?? 10,
            mode,
            publishBehavior,
            useStoredConnection: Boolean(input.useStoredConnection),
            organizationId: input.organizationId,
            apiKey: input.apiKey,
          });
        } catch (err) {
          if (err instanceof NotraImportRateLimitError) {
            c.header("Retry-After", String(Math.max(1, err.retryAfterSeconds)));
            throw new HTTPException(429, {
              message:
                "Too many Notra import attempts. Please wait and try again.",
            });
          }
          const failureReason =
            err instanceof NotraStoredConnectionError
              ? "stored_connection"
              : err instanceof SecretCryptoError
                ? "crypto"
                : err instanceof NotraApiError
                  ? `notra_api_${err.status}`
                  : "unexpected";
          await recordImportFailure(failureReason);
          if (err instanceof NotraStoredConnectionError) {
            throw new HTTPException(400, { message: err.message });
          }
          if (err instanceof SecretCryptoError) {
            throw new HTTPException(503, {
              message: "Credential encryption is not configured correctly",
            });
          }
          if (err instanceof NotraApiError) {
            if (err.status === 401 || err.status === 403) {
              throw new HTTPException(400, {
                message:
                  "Notra authentication failed. Verify your API key and organization ID.",
              });
            }
            if (err.status === 404) {
              throw new HTTPException(400, {
                message:
                  "Notra organization was not found or is not accessible with this API key.",
              });
            }
            if (err.status === 429) {
              if (err.retryAfterSeconds && err.retryAfterSeconds > 0) {
                c.header("Retry-After", String(err.retryAfterSeconds));
              }
              throw new HTTPException(429, {
                message: "Notra rate limit reached. Please wait and try again.",
              });
            }
            if (err.status === 503) {
              throw new HTTPException(503, {
                message:
                  "Notra service is temporarily unavailable. Please try again.",
              });
            }
            throw new HTTPException(502, {
              message: "Notra API request failed. Please try again.",
            });
          }
          throw err;
        }

        await ctx.db.insert(activityLog).values({
          workspaceId: ws.id,
          userId: ctx.session.user.id,
          action: ACTIVITY_ACTIONS.CHANGELOG_NOTRA_IMPORTED,
          actionType:
            summary.createdCount > 0 && summary.updatedCount === 0
              ? "create"
              : "update",
          entity: "changelog_entry",
          entityId: String(changelogBoardId),
          title: "Notra import",
          metadata: {
            fetchedCount: summary.fetchedCount,
            createdCount: summary.createdCount,
            updatedCount: summary.updatedCount,
            skippedCount: summary.skippedCount,
            truncatedCount: summary.truncatedCount,
            limitReached: summary.limitReached,
            mode,
            publishBehavior,
            usedStoredConnection: summary.usedStoredConnection,
          },
        });

        return c.superjson({
          ok: true,
          summary,
        });
      }),
  };
}
