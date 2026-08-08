import { HTTPException } from "hono/http-exception";
import { aiAssistSchema } from "../validators/changelog";
import { requireBoardManagerBySlug } from "../shared/access";
import { enforceTrustedBrowserOrigin } from "../shared/request-origin";
import { applyRateLimitHeaders, limitPrivate } from "../services/ratelimiter";
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
import { buildStreamRefineUserPrompt } from "./prompts";
import { sanitizeChangelogAiError } from "./security";
import { createSseStreamHeaders, encodeChangelogAiSseEvent } from "./sse";
import {
  fetchAiSourcePostsByIds,
  getWorkspaceNameForAi,
} from "./source-posts";
import { streamStructuredChangelog } from "./structured-generation";
import {
  extractSummaryFromMarkdown,
  extractTitleFromMarkdown,
  usesStructuredChangelogStream,
} from "./title";
import type { AiAction, ChangelogAiStreamEvent, StructuredGenerationAction } from "./types";

export async function createChangelogAiStreamResponse(req: Request) {
  enforceTrustedBrowserOrigin(req);

  const session = await import("@featul/auth/auth").then(({ auth }) =>
    auth.api.getSession({ headers: req.headers }),
  );

  if (!session?.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rateLimit = await limitPrivate(req, session.user.id);
  if (!rateLimit.success) {
    return new Response(JSON.stringify({ message: "Too Many Requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(1, rateLimit.reset)),
      },
    });
  }

  let parsedInput;
  try {
    const json = await req.json();
    parsedInput = aiAssistSchema.parse(json);
  } catch {
    return new Response(JSON.stringify({ message: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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
    return new Response(JSON.stringify({ message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const model = resolveOpenRouterStreamModel(parsedInput.action);
  const structured = usesStructuredChangelogStream(parsedInput.action);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: ChangelogAiStreamEvent) => {
        controller.enqueue(encoder.encode(encodeChangelogAiSseEvent(event)));
      };

      try {
        send({ type: "status", phase: "preparing" });

        const needsSourcePosts =
          parsedInput.action === "generateFromPosts" &&
          Boolean(parsedInput.sourcePostIds?.length);

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

        if (needsSourcePosts && (!sourcePosts || sourcePosts.length === 0)) {
          send({
            type: "error",
            message: "No valid shipped feedback items were found for generation",
          });
          controller.close();
          return;
        }

        send({ type: "status", phase: "generating" });

        if (structured) {
          const result = await streamStructuredChangelog({
            model,
            action: parsedInput.action as StructuredGenerationAction,
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

        const userPrompt = buildStreamRefineUserPrompt({
          action: parsedInput.action,
          prompt: parsedInput.prompt,
          title: parsedInput.title,
          contentMarkdown: parsedInput.contentMarkdown,
          tone: parsedInput.tone,
          detailLevel: parsedInput.detailLevel,
          workspaceName,
          sourcePosts,
        });

        const systemPrompt =
          parsedInput.action === "summary"
            ? AI_STREAM_SUMMARY_SYSTEM_PROMPT
            : AI_STREAM_REFINE_SYSTEM_PROMPT;

        let accumulated = "";

        await streamOpenRouterChat(
          {
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
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
