import { HTTPException } from "hono/http-exception";
import { aiAssistSchema } from "../validators/changelog";
import { requireBoardManagerBySlug } from "../shared/access";
import { applyRateLimitHeaders } from "../services/ratelimiter";
import {
  authorizePrivateChangelogAiRequest,
  changelogAiJsonResponse,
} from "./auth";
import {
  resolveOpenRouterStreamModel,
  streamOpenRouterChat,
} from "../services/openrouter";
import {
  AI_STREAM_REFINE_SYSTEM_PROMPT,
  AI_STREAM_SUMMARY_SYSTEM_PROMPT,
  AI_TEMPERATURE_BY_ACTION,
  getMaxTokensByAction,
} from "./constants";
import {
  buildChatRefineOpenRouterMessages,
  buildStreamRefineUserPrompt,
} from "./prompts";
import { sanitizeChangelogAiError } from "./security";
import { createSseStreamHeaders, encodeChangelogAiSseEvent } from "./sse";
import {
  fetchAiSourcePostsByIds,
  getWorkspaceNameForAi,
} from "./sources";
import { streamStructuredChangelog } from "./generation";
import {
  extractSummaryFromMarkdown,
  extractTitleFromMarkdown,
  usesStructuredChangelogStream,
} from "./title";
import type { AiAction, ChangelogAiStreamEvent, StructuredGenerationAction } from "./types";

export async function createChangelogAiStreamResponse(req: Request) {
  const authResult = await authorizePrivateChangelogAiRequest(req);
  if (authResult instanceof Response) {
    return authResult;
  }

  const { session, rateLimit } = authResult;

  let parsedInput;
  try {
    const json = await req.json();
    parsedInput = aiAssistSchema.parse(json);
  } catch {
    return changelogAiJsonResponse(400, { message: "Invalid request" });
  }

  const { db } = await import("@featul/db");
  const ctx = { db, session };

  let workspace;
  try {
    workspace = await requireBoardManagerBySlug(ctx, parsedInput.slug);
  } catch (err) {
    const message =
      err instanceof HTTPException ? err.message : "Forbidden";
    const status = err instanceof HTTPException ? err.status : 403;
    return changelogAiJsonResponse(status, { message });
  }

  const model = resolveOpenRouterStreamModel(parsedInput.action);
  const hasExistingContent = Boolean(parsedInput.contentMarkdown?.trim());
  const structured = usesStructuredChangelogStream(
    parsedInput.action,
    hasExistingContent,
  );

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: ChangelogAiStreamEvent) => {
        controller.enqueue(encoder.encode(encodeChangelogAiSseEvent(event)));
      };

      try {
        send({ type: "status", phase: "preparing" });

        const needsSourcePosts = Boolean(parsedInput.sourcePostIds?.length);

        const [sourcePosts, workspaceName] = await Promise.all([
          needsSourcePosts
            ? fetchAiSourcePostsByIds({
                db,
                workspaceId: workspace.id,
                postIds: parsedInput.sourcePostIds!,
              })
            : Promise.resolve(undefined),
          getWorkspaceNameForAi({
            db,
            workspaceId: workspace.id,
          }),
        ]);

        if (
          parsedInput.action === "generateFromPosts" &&
          (!sourcePosts || sourcePosts.length === 0)
        ) {
          send({
            type: "error",
            message: "No valid shipped feedback items were found for generation",
          });
          controller.close();
          return;
        }

        send({ type: "status", phase: "generating" });

        if (structured) {
          const structuredAction: StructuredGenerationAction =
            parsedInput.action === "chat"
              ? sourcePosts?.length
                ? "generateFromPosts"
                : "prompt"
              : (parsedInput.action as StructuredGenerationAction);

          const result = await streamStructuredChangelog({
            model,
            action: structuredAction,
            temperature: AI_TEMPERATURE_BY_ACTION[parsedInput.action],
            maxBodyTokens: getMaxTokensByAction(
              parsedInput.action,
              parsedInput.detailLevel,
            ),
            prompt: parsedInput.prompt,
            tone: parsedInput.tone,
            detailLevel: parsedInput.detailLevel,
            workspaceName,
            sourcePosts,
            send,
          });

          if (!result.contentMarkdown) {
            send({ type: "error", message: "AI response was empty" });
            controller.close();
            return;
          }

          send({
            type: "done",
            title: result.title,
            contentMarkdown: result.contentMarkdown,
          });
          controller.close();
          return;
        }

        const chatMessages =
          parsedInput.action === "chat"
            ? buildChatRefineOpenRouterMessages({
                prompt: parsedInput.prompt ?? "",
                title: parsedInput.title,
                contentMarkdown: parsedInput.contentMarkdown,
                workspaceName,
                sourcePosts,
                history: parsedInput.messages,
              })
            : [
                {
                  role: "system" as const,
                  content:
                    parsedInput.action === "summary"
                      ? AI_STREAM_SUMMARY_SYSTEM_PROMPT
                      : AI_STREAM_REFINE_SYSTEM_PROMPT,
                },
                {
                  role: "user" as const,
                  content: buildStreamRefineUserPrompt({
                    action: parsedInput.action,
                    prompt: parsedInput.prompt,
                    title: parsedInput.title,
                    contentMarkdown: parsedInput.contentMarkdown,
                    tone: parsedInput.tone,
                    detailLevel: parsedInput.detailLevel,
                    workspaceName,
                    sourcePosts,
                  }),
                },
              ];

        let accumulated = "";

        await streamOpenRouterChat(
          {
            model,
            messages: chatMessages,
            temperature: AI_TEMPERATURE_BY_ACTION[parsedInput.action as AiAction],
            max_tokens: getMaxTokensByAction(
              parsedInput.action,
              parsedInput.detailLevel,
            ),
          },
          (text) => {
            accumulated += text;
            send({ type: "delta", text });
          },
        );

        const trimmed = accumulated.trim();
        if (!trimmed) {
          send({ type: "error", message: "AI response was empty" });
          controller.close();
          return;
        }

        if (parsedInput.action === "summary") {
          send({
            type: "done",
            summary: trimmed.slice(0, 512),
          });
          controller.close();
          return;
        }

        send({
          type: "done",
          contentMarkdown: trimmed,
          title: extractTitleFromMarkdown(trimmed, parsedInput.title),
          summary: extractSummaryFromMarkdown(trimmed),
        });
        controller.close();
      } catch (err) {
        send({ type: "error", message: sanitizeChangelogAiError(err) });
        controller.close();
      }
    },
  });

  const headers = createSseStreamHeaders();
  applyRateLimitHeaders(
    { header: (key: string, value: string) => headers.set(key, value) },
    rateLimit,
    "Too Many Requests",
  );

  return new Response(stream, { headers });
}
