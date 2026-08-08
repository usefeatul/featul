import { HTTPException } from "hono/http-exception";
import { aiAssistSchema } from "../validators/changelog";
import { requireBoardManagerBySlug } from "../shared/access";
import { enforceTrustedBrowserOrigin } from "../shared/request-origin";
import { limitPrivate, applyRateLimitHeaders } from "./ratelimiter";
import { streamOpenRouterChat, resolveOpenRouterStreamModel } from "./openrouter";
import {
  buildAiUserPrompt,
  buildBodyStreamPrompt,
  buildTitleStreamPrompt,
  fetchAiSourcePostsByIds,
  getWorkspaceNameForAi,
  type AiAction,
} from "./changelog-ai-context";
import {
  extractTitleLine,
  isValidChangelogTitle,
  resolveAiChangelogTitle,
  usesStructuredChangelogStream,
} from "./changelog-ai-stream-parser";

const AI_STREAM_TITLE_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY one TITLE line in the requested format.",
  "The title must be specific, descriptive, and 5-12 words.",
  "Never use generic titles like 'Product update', 'Release', or single-word titles.",
  "Start line 1 with TITLE: immediately. No preamble.",
].join(" ");

const AI_STREAM_BODY_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY the markdown body. No TITLE, SUMMARY, JSON, or fences.",
  "Use GitHub-flavored Markdown with ## headings and bullet lists.",
].join(" ");

const AI_STREAM_REFINE_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY the requested markdown output. No JSON, fences, or commentary.",
].join(" ");

const AI_STREAM_SUMMARY_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY a 2-3 sentence summary (<= 512 characters) with no quotes or labels.",
].join(" ");

type StreamEvent =
  | { type: "status"; phase: "preparing" | "generating" }
  | { type: "delta"; text: string }
  | { type: "title"; text: string }
  | { type: "summary"; text: string }
  | {
      type: "done";
      contentMarkdown?: string;
      summary?: string;
      title?: string;
    }
  | { type: "error"; message: string };

function encodeSseEvent(event: StreamEvent) {
  return `: ${Date.now()}\ndata: ${JSON.stringify(event)}\n\n`;
}

function extractTitleFromMarkdown(markdown: string, fallback?: string) {
  for (const line of markdown.split("\n")) {
    const match = line.match(/^#\s+(.+)$/);
    if (match?.[1]) {
      return match[1].trim().slice(0, 256);
    }
  }
  return fallback?.trim().slice(0, 256);
}

function extractSummaryFromMarkdown(markdown: string) {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith("#"));

  if (!paragraph) return undefined;

  return paragraph.replace(/\s+/g, " ").trim().slice(0, 512);
}

function buildStreamUserPrompt(input: {
  action: AiAction;
  prompt?: string;
  title?: string;
  contentMarkdown?: string;
  tone?: "user-friendly" | "technical" | "brief";
  detailLevel?: "standard" | "detailed";
  workspaceName?: string;
  sourcePosts?: Awaited<ReturnType<typeof fetchAiSourcePostsByIds>>;
}) {
  const base = buildAiUserPrompt(input);

  if (input.action === "summary") {
    return [base, "Output format: plain text summary only."].join("\n\n");
  }

  if (usesStructuredChangelogStream(input.action)) {
    return [
      base,
      "Output format (exact order, start line 1 with TITLE:):",
      "TITLE: <clear title>",
      "---",
      "<markdown body with ## headings and bullets>",
    ].join("\n");
  }

  return [
    base,
    "Output format: GitHub-flavored Markdown body only.",
    "Do not include a JSON object or code fences.",
  ].join("\n\n");
}

function emitBodyStreamEvents(
  body: string,
  state: { sentBodyLength: number },
  send: (event: StreamEvent) => void,
) {
  if (body.length <= state.sentBodyLength) return;

  const delta = body.slice(state.sentBodyLength);
  if (!delta) return;

  send({ type: "delta", text: delta });
  state.sentBodyLength = body.length;
}

async function generateChangelogTitle(input: {
  model: string;
  action: Extract<AiAction, "prompt" | "generateFromPosts">;
  temperature: number;
  prompt?: string;
  tone?: "user-friendly" | "technical" | "brief";
  workspaceName?: string;
  sourcePosts?: Awaited<ReturnType<typeof fetchAiSourcePostsByIds>>;
}) {
  const requestTitle = async (extraInstruction?: string) => {
    let raw = "";
    await streamOpenRouterChat(
      {
        model: input.model,
        messages: [
          { role: "system", content: AI_STREAM_TITLE_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              buildTitleStreamPrompt({
                action: input.action,
                prompt: input.prompt,
                tone: input.tone,
                workspaceName: input.workspaceName,
                sourcePosts: input.sourcePosts,
              }),
              extraInstruction,
            ]
              .filter(Boolean)
              .join("\n\n"),
          },
        ],
        temperature: Math.min(input.temperature, 0.35),
        max_tokens: 120,
      },
      (text) => {
        raw += text;
      },
    );
    return raw;
  };

  let titleRaw = await requestTitle();
  const firstTitle = extractTitleLine(titleRaw);
  if (!firstTitle || !isValidChangelogTitle(firstTitle)) {
    titleRaw = await requestTitle(
      "The previous title was too generic or invalid. Rewrite it to explicitly mention the shipped feedback topics below.",
    );
  }

  return resolveAiChangelogTitle(titleRaw, input.sourcePosts);
}

async function streamStructuredChangelog(input: {
  model: string;
  action: Extract<AiAction, "prompt" | "generateFromPosts">;
  temperature: number;
  maxBodyTokens: number;
  prompt?: string;
  tone?: "user-friendly" | "technical" | "brief";
  detailLevel?: "standard" | "detailed";
  workspaceName?: string;
  sourcePosts?: Awaited<ReturnType<typeof fetchAiSourcePostsByIds>>;
  send: (event: StreamEvent) => void;
}) {
  const finalTitle = await generateChangelogTitle(input);
  input.send({ type: "title", text: finalTitle });

  const structuredState = {
    sentBodyLength: 0,
  };

  let body = "";
  await streamOpenRouterChat(
    {
      model: input.model,
      messages: [
        { role: "system", content: AI_STREAM_BODY_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildBodyStreamPrompt({
            action: input.action,
            title: finalTitle,
            prompt: input.prompt,
            tone: input.tone,
            detailLevel: input.detailLevel,
            workspaceName: input.workspaceName,
            sourcePosts: input.sourcePosts,
          }),
        },
      ],
      temperature: input.temperature,
      max_tokens: input.maxBodyTokens,
    },
    (text) => {
      body += text;
      emitBodyStreamEvents(body, structuredState, input.send);
    },
  );

  return {
    title: finalTitle,
    contentMarkdown: body.trim(),
  };
}

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
  const temperatureByAction: Record<AiAction, number> = {
    prompt: 0.55,
    generateFromPosts: 0.55,
    format: 0.2,
    improve: 0.35,
    expand: 0.45,
    summary: 0.2,
  };
  const maxTokensByAction: Partial<Record<AiAction, number>> = {
    prompt: 2200,
    generateFromPosts:
      parsedInput.detailLevel === "standard" ? 1800 : 3200,
    improve: 1600,
    expand: 2800,
    summary: 256,
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(encodeSseEvent(event)));
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
            action: parsedInput.action as Extract<
              AiAction,
              "generateFromPosts" | "prompt"
            >,
            temperature: temperatureByAction[parsedInput.action],
            maxBodyTokens: maxTokensByAction[parsedInput.action] ?? 900,
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

        const userPrompt = buildStreamUserPrompt({
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
            temperature: temperatureByAction[parsedInput.action],
            max_tokens: maxTokensByAction[parsedInput.action] ?? 900,
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

        const title = extractTitleFromMarkdown(trimmed, parsedInput.title);
        const summary = extractSummaryFromMarkdown(trimmed);

        send({
          type: "done",
          contentMarkdown: trimmed,
          title,
          summary,
        });
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate AI response";
        send({ type: "error", message });
        controller.close();
      }
    },
  });

  const headers = new Headers({
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  applyRateLimitHeaders(
    { header: (key: string, value: string) => headers.set(key, value) },
    rateLimit,
    "Too Many Requests",
  );

  return new Response(stream, { headers });
}
