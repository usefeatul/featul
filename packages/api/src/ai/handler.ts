import { runChangelogConversation } from "./conversation";
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
  buildChatTagsOpenRouterMessages,
  buildStreamRefineUserPrompt,
} from "./prompts";
import { sanitizeChangelogAiError } from "./security";
import { createSseStreamHeaders, encodeChangelogAiSseEvent } from "./sse";
import {
  ensureFeedbackSection,
  fetchAiBrandContext,
  fetchAiSourcePostsByIds,
} from "./sources";
import { streamStructuredChangelog } from "./generation";
import {
  extractAiOutputMeta,
  extractSummaryFromMarkdown,
  extractTitleFromMarkdown,
  usesStructuredChangelogStream,
} from "./title";
import type {
  AiAction,
  ChangelogAiStreamEvent,
  StructuredGenerationAction,
} from "./types";

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
    const message = err instanceof HTTPException ? err.message : "Forbidden";
    const status = err instanceof HTTPException ? err.status : 403;
    return changelogAiJsonResponse(status, { message });
  }

  const model = resolveOpenRouterStreamModel();
  const hasExistingContent = Boolean(parsedInput.contentMarkdown?.trim());
  const intent = parsedInput.intent ?? "conversation";
  const structured =
    parsedInput.action !== "chat" &&
    usesStructuredChangelogStream(parsedInput.action, hasExistingContent);

  let cancelled = false;
  const upstream = new AbortController();
  const abort = () => {
    cancelled = true;
    upstream.abort();
  };
  req.signal.addEventListener("abort", abort, { once: true });
  if (req.signal.aborted) abort();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: ChangelogAiStreamEvent) => {
        if (!cancelled)
          controller.enqueue(encoder.encode(encodeChangelogAiSseEvent(event)));
      };

      const close = () => {
        if (!cancelled) controller.close();
      };

      try {
        if (cancelled) return;
        send({ type: "status", phase: "preparing" });

        const needsSourcePosts = Boolean(parsedInput.sourcePostIds?.length);

        const workspaceName = workspace.name?.trim() || "this product";
        const needsBrandContext = intent !== "ask";
        const [sourcePosts, brandContext] = await Promise.all([
          needsSourcePosts
            ? fetchAiSourcePostsByIds({
                db,
                workspaceId: workspace.id,
                postIds: parsedInput.sourcePostIds!,
              })
            : Promise.resolve(undefined),
          needsBrandContext
            ? fetchAiBrandContext({
                db,
                workspaceId: workspace.id,
              })
            : Promise.resolve({ brandVoice: "", tagNames: [] as string[] }),
        ]);

        if (
          parsedInput.action === "generateFromPosts" &&
          (!sourcePosts || sourcePosts.length === 0)
        ) {
          send({
            type: "error",
            message:
              "No valid shipped feedback items were found for generation",
          });
          close();
          return;
        }

        const availableTagNames = parsedInput.availableTagNames?.length
          ? parsedInput.availableTagNames
          : brandContext.tagNames;
        const githubUrls = parsedInput.githubUrls;

        send({ type: "status", phase: "generating" });

        if (parsedInput.action === "chat" && intent !== "tags") {
          const result = await runChangelogConversation(
            model,
            {
              prompt: parsedInput.prompt!,
              title: parsedInput.title,
              summary: parsedInput.summary,
              contentMarkdown: parsedInput.contentMarkdown,
              selectionMarkdown: parsedInput.selectionMarkdown,
              history: parsedInput.messages,
              workspaceName,
              sourcePosts,
              brandVoice: brandContext.brandVoice,
              githubUrls,
              availableTagNames: brandContext.tagNames,
              selectedTagNames: parsedInput.selectedTagNames,
              pendingTagNames: parsedInput.pendingTagNames,
              readOnly: intent === "ask",
            },
            upstream.signal,
            (text) => send({ type: "delta", text }),
          );
          send({ type: "done", ...result });
          close();
          return;
        }

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
            brandVoice: brandContext.brandVoice,
            githubUrls,
            availableTagNames,
            send,
          });

          if (!result.contentMarkdown) {
            send({ type: "error", message: "AI response was empty" });
            close();
            return;
          }

          const meta = extractAiOutputMeta(result.contentMarkdown);
          const contentMarkdown = ensureFeedbackSection(
            meta.body,
            sourcePosts ?? [],
          );

          send({
            type: "done",
            title: result.title,
            contentMarkdown,
            suggestedTags: meta.suggestedTags,
            summary: extractSummaryFromMarkdown(contentMarkdown),
          });
          close();
          return;
        }

        if (
          parsedInput.action === "chat" &&
          intent === "tags" &&
          availableTagNames.length === 0
        ) {
          send({
            type: "done",
            reply: "This workspace does not have any changelog tags yet.",
            suggestedTags: [],
          });
          close();
          return;
        }

        const chatMessages =
          parsedInput.action === "chat"
            ? buildChatTagsOpenRouterMessages({
                prompt: parsedInput.prompt ?? "",
                title: parsedInput.title,
                contentMarkdown: parsedInput.contentMarkdown,
                workspaceName,
                availableTagNames,
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
                    ...parsedInput,
                    workspaceName,
                    sourcePosts,
                  }),
                },
              ];

        let accumulated = "";
        const maxTokens =
          intent === "tags"
            ? 120
            : getMaxTokensByAction(parsedInput.action, parsedInput.detailLevel);

        await streamOpenRouterChat(
          {
            model,
            messages: chatMessages,
            temperature:
              AI_TEMPERATURE_BY_ACTION[parsedInput.action as AiAction],
            max_tokens: maxTokens,
          },
          (text) => {
            accumulated += text;
            send({ type: "delta", text });
          },
        );

        const trimmed = accumulated.trim();
        if (!trimmed) {
          send({ type: "error", message: "AI response was empty" });
          close();
          return;
        }

        if (parsedInput.action === "summary") {
          send({
            type: "done",
            summary: trimmed.slice(0, 512),
          });
          close();
          return;
        }

        if (intent === "tags") {
          const meta = extractAiOutputMeta(trimmed);
          const existingTags = new Map(
            availableTagNames.map((name) => [name.toLowerCase(), name]),
          );
          const suggestedTags = (meta.suggestedTags ?? [])
            .map((name) => existingTags.get(name.toLowerCase()))
            .filter((name): name is string => Boolean(name))
            .slice(0, 4);
          send({
            type: "done",
            reply: suggestedTags.length
              ? `Found ${suggestedTags.length} relevant workspace tags.`
              : "No relevant tags were found.",
            suggestedTags,
          });
          close();
          return;
        }

        const meta = extractAiOutputMeta(trimmed);
        const contentMarkdown = ensureFeedbackSection(
          meta.body,
          sourcePosts ?? [],
        );

        send({
          type: "done",
          contentMarkdown,
          title:
            meta.title ||
            extractTitleFromMarkdown(contentMarkdown, parsedInput.title),
          summary:
            parsedInput.action === "chat"
              ? undefined
              : extractSummaryFromMarkdown(contentMarkdown),
          suggestedTags: meta.suggestedTags,
        });
        close();
      } catch (err) {
        send({ type: "error", message: sanitizeChangelogAiError(err) });
        close();
      } finally {
        req.signal.removeEventListener("abort", abort);
      }
    },
    cancel: abort,
  });

  const headers = createSseStreamHeaders();
  applyRateLimitHeaders(
    { header: (key: string, value: string) => headers.set(key, value) },
    rateLimit,
    "Too Many Requests",
  );

  return new Response(stream, { headers });
}
