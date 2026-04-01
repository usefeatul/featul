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
import { ACTIVITY_ACTIONS } from "../shared/activity-actions";
import {
  deleteNotraConnectionSchema,
  getNotraConnectionSchema,
  importNotraSchema,
  saveNotraConnectionSchema,
  aiAssistSchema,
} from "../validators/changelog";
import { sendOpenRouterChat } from "../services/openrouter";
import {
  deleteStoredNotraConnection,
  getStoredNotraConnection,
  NotraApiError,
  NotraImportRateLimitError,
  NotraStoredConnectionError,
  runNotraImport,
  storeNotraConnection,
} from "../services/notra-import";
import {
  canEncryptSecrets,
  SecretCryptoError,
} from "../services/secret-crypto";

type AiAction = "prompt" | "format" | "improve" | "summary";

const AI_SYSTEM_PROMPT = [
  "You are a product changelog writing assistant.",
  "Return ONLY valid JSON. No markdown fences, no commentary.",
  "JSON keys: title, contentMarkdown, summary. Omit keys you are not asked to return.",
  "contentMarkdown must be GitHub-flavored Markdown.",
].join(" ");

function buildAiUserPrompt(input: {
  action: AiAction;
  prompt?: string;
  title?: string;
  contentMarkdown?: string;
}) {
  const titleLine = input.title?.trim() ? `Title: ${input.title.trim()}` : "";
  const contentBlock = input.contentMarkdown
    ? `Content (Markdown):\n${input.contentMarkdown}`
    : "";

  switch (input.action) {
    case "prompt":
      return [
        "Write a changelog entry based on the prompt below.",
        "Requirements:",
        "- Provide a short, clear title.",
        "- Write a concise Markdown body with headings or bullets when helpful.",
        "- Provide a 1-2 sentence summary (<= 512 characters).",
        titleLine ? `Current title (if helpful): ${titleLine}` : "",
        "Prompt:",
        input.prompt || "",
      ]
        .filter(Boolean)
        .join("\n");
    case "format":
      return [
        "Fix formatting and structure without changing meaning.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "improve":
      return [
        "Improve clarity and concision without changing meaning.",
        "Return JSON with contentMarkdown only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    case "summary":
      return [
        "Write a concise 1-2 sentence summary (<= 512 characters).",
        "Return JSON with summary only.",
        titleLine,
        contentBlock,
      ]
        .filter(Boolean)
        .join("\n\n");
    default:
      return "";
  }
}

function parseAiJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new HTTPException(502, { message: "AI response was not valid JSON" });
  }
  const slice = text.slice(start, end + 1);
  return JSON.parse(slice) as {
    contentMarkdown?: unknown;
    summary?: unknown;
    title?: unknown;
  };
}

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
    aiAssist: privateProcedure
      .input(aiAssistSchema)
      .post(async ({ ctx, input, c }) => {
        await requireBoardManagerBySlug(ctx, input.slug);

        const model = String(process.env.OPENROUTER_MODEL || "openrouter/auto");
        const temperatureByAction: Record<AiAction, number> = {
          prompt: 0.6,
          format: 0.2,
          improve: 0.4,
          summary: 0.2,
        };

        try {
          const result = await sendOpenRouterChat({
            model,
            messages: [
              { role: "system", content: AI_SYSTEM_PROMPT },
              { role: "user", content: buildAiUserPrompt(input) },
            ],
            temperature: temperatureByAction[input.action],
            max_tokens: 900,
            response_format: { type: "json_object" },
          });

          const message = (result as any)?.choices?.[0]?.message?.content;
          if (!message || typeof message !== "string") {
            throw new HTTPException(502, { message: "AI response was empty" });
          }

          const data = parseAiJson(message);

          const contentMarkdown =
            typeof data.contentMarkdown === "string"
              ? data.contentMarkdown.trim()
              : undefined;
          const title =
            typeof data.title === "string"
              ? data.title.trim().slice(0, 256)
              : undefined;
          const summaryRaw =
            typeof data.summary === "string" ? data.summary.trim() : undefined;
          const summary = summaryRaw ? summaryRaw.slice(0, 512) : undefined;

          return c.superjson({ ok: true, contentMarkdown, title, summary });
        } catch (err) {
          if (err instanceof HTTPException) {
            throw err;
          }
          const message =
            err instanceof Error
              ? err.message
              : "Failed to generate AI response";
          throw new HTTPException(500, { message });
        }
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
