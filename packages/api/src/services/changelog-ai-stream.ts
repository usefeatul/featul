import { HTTPException } from "hono/http-exception";
import { aiAssistSchema } from "../validators/changelog";
import { requireBoardManagerBySlug } from "../shared/access";
import { enforceTrustedBrowserOrigin } from "../shared/request-origin";
import { limitPrivate, applyRateLimitHeaders } from "./ratelimiter";
import { streamOpenRouterChat } from "./openrouter";
import {
  buildAiUserPrompt,
  fetchAiSourcePostsByIds,
  getWorkspaceNameForAi,
  type AiAction,
} from "./changelog-ai-context";
import {
  parseStructuredChangelogStream,
  usesStructuredChangelogStream,
} from "./changelog-ai-stream-parser";

const AI_STREAM_SYSTEM_PROMPT = [
  "You are an expert product changelog writer for SaaS products.",
  "Write polished, publish-ready changelog content that helps users understand what shipped and why it matters.",
  "Return ONLY the requested output format. No JSON, no markdown fences, no commentary before or after.",
  "Use GitHub-flavored Markdown with headings, paragraphs, and bullet lists when writing body content.",
  "Prefer substantive, well-structured entries over short summaries.",
].join(" ");

const AI_STREAM_SUMMARY_SYSTEM_PROMPT = [
  "You are an expert product changelog writer.",
  "Return ONLY a 2-3 sentence summary (<= 512 characters) with no quotes or labels.",
].join(" ");

type StreamEvent =
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
  return `data: ${JSON.stringify(event)}\n\n`;
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
      "Output format (use exactly this structure, in this order):",
      "TITLE: <clear, compelling title>",
      "SUMMARY: <2-3 sentence list preview, <= 512 characters>",
      "---",
      "<markdown body with ## headings and bullets. Do not repeat the title as # heading.>",
    ].join("\n");
  }

  return [
    base,
    "Output format: GitHub-flavored Markdown body only.",
    "Do not include a JSON object or code fences.",
  ].join("\n\n");
}

function emitStructuredStreamEvents(
  accumulated: string,
  state: {
    sentTitle: boolean;
    sentSummaryLength: number;
    sentBodyLength: number;
  },
  send: (event: StreamEvent) => void,
) {
  const parsed = parseStructuredChangelogStream(accumulated);

  if (!state.sentTitle && parsed.title && /^TITLE:.+\r?\n/im.test(accumulated)) {
    send({ type: "title", text: parsed.title.slice(0, 256) });
    state.sentTitle = true;
  }

  if (
    parsed.summary &&
    parsed.summary.length > state.sentSummaryLength &&
    /^SUMMARY:/im.test(accumulated)
  ) {
    send({ type: "summary", text: parsed.summary.slice(0, 512) });
    state.sentSummaryLength = parsed.summary.length;
  }

  if (parsed.body.length > state.sentBodyLength) {
    const delta = parsed.body.slice(state.sentBodyLength);
    if (delta) {
      send({ type: "delta", text: delta });
      state.sentBodyLength = parsed.body.length;
    }
  }
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

  const model = String(process.env.OPENROUTER_MODEL || "openrouter/auto");
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

  let sourcePosts;
  if (
    parsedInput.action === "generateFromPosts" &&
    parsedInput.sourcePostIds?.length
  ) {
    sourcePosts = await fetchAiSourcePostsByIds({
      db,
      workspaceId: workspace.id,
      postIds: parsedInput.sourcePostIds,
    });

    if (sourcePosts.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No valid shipped feedback items were found for generation",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const workspaceName = await getWorkspaceNameForAi({
    db,
    workspaceId: workspace.id,
  });

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
      : AI_STREAM_SYSTEM_PROMPT;

  const structured = usesStructuredChangelogStream(parsedInput.action);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(encodeSseEvent(event)));
      };

      try {
        let accumulated = "";
        const structuredState = {
          sentTitle: false,
          sentSummaryLength: 0,
          sentBodyLength: 0,
        };

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
          async (text) => {
            accumulated += text;

            if (structured) {
              emitStructuredStreamEvents(accumulated, structuredState, send);
              return;
            }

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

        if (structured) {
          const parsed = parseStructuredChangelogStream(trimmed);
          send({
            type: "done",
            title: parsed.title?.slice(0, 256) ?? parsedInput.title,
            summary: parsed.summary?.slice(0, 512),
            contentMarkdown: parsed.body.trim(),
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
  });
  applyRateLimitHeaders(
    { header: (key: string, value: string) => headers.set(key, value) },
    rateLimit,
    "Too Many Requests",
  );

  return new Response(stream, { headers });
}
