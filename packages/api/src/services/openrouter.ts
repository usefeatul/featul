import { HTTPException } from "hono/http-exception";

let openRouterClient: import("@openrouter/sdk").OpenRouter | null = null;

async function getOpenRouterClient() {
  const { OpenRouter } = await import("@openrouter/sdk");
  const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) {
    throw new HTTPException(500, {
      message: "Missing OpenRouter env: OPENROUTER_API_KEY",
    });
  }
  if (!openRouterClient) {
    openRouterClient = new OpenRouter({ apiKey });
  }
  return openRouterClient;
}

export async function sendOpenRouterChat(request: any) {
  const client = await getOpenRouterClient();
  return client.chat.send(request);
}

function getOpenRouterHeaders() {
  const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) {
    throw new HTTPException(500, {
      message: "Missing OpenRouter env: OPENROUTER_API_KEY",
    });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };

  const referer = String(process.env.OPENROUTER_REFERER || "").trim();
  const appName = String(process.env.OPENROUTER_APP_NAME || "").trim();
  if (referer) headers["HTTP-Referer"] = referer;
  if (appName) headers["X-Title"] = appName;

  return headers;
}

export async function streamOpenRouterChat(
  request: Record<string, unknown>,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
  onToolCall?: (call: { name: string; arguments: string }) => void,
) {
  const headers = getOpenRouterHeaders();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({ ...request, stream: true }),
    signal,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new HTTPException(res.status as 400, {
      message: errorBody || "OpenRouter request failed",
    });
  }

  if (!res.body) {
    throw new HTTPException(500, { message: "OpenRouter stream was empty" });
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = false;
  const toolCalls = new Map<number, { name: string; arguments: string }>();

  const consume = (chunk: string) => {
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      if (payload === "[DONE]") continue;
      const parsed = JSON.parse(payload) as {
        error?: unknown;
        choices?: Array<{
          delta?: {
            content?: string | null;
            tool_calls?: Array<{
              index: number;
              function?: { name?: string; arguments?: string };
            }>;
          };
          finish_reason?: string | null;
        }>;
      };
      const choice = parsed.choices?.[0];
      if (
        parsed.error ||
        (choice?.finish_reason &&
          choice.finish_reason !== "stop" &&
          !(onToolCall && choice.finish_reason === "tool_calls"))
      ) {
        throw new Error("Failed to generate AI response");
      }
      if (
        choice?.finish_reason === "stop" ||
        choice?.finish_reason === "tool_calls"
      )
        completed = true;
      const text = choice?.delta?.content;
      if (typeof text === "string" && text) onDelta(text);
      for (const delta of choice?.delta?.tool_calls ?? []) {
        const call = toolCalls.get(delta.index) ?? { name: "", arguments: "" };
        if (delta.function?.name) call.name = delta.function.name;
        call.arguments += delta.function?.arguments ?? "";
        toolCalls.set(delta.index, call);
      }
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");

        consume(chunk);
      }
    }
    buffer += decoder.decode();
    if (buffer.trim()) consume(buffer);
    if (!completed) throw new Error("Failed to generate AI response");
    if (toolCalls.size && !onToolCall)
      throw new Error("Failed to generate AI response");
    for (const call of toolCalls.values()) onToolCall?.(call);
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

// Dedicated writing model: legacy automation settings must not silently keep
// changelog conversations on the old Flash model.
export function resolveOpenRouterStreamModel() {
  return (
    String(process.env.OPENROUTER_CHANGELOG_MODEL || "").trim() ||
    "anthropic/claude-sonnet-4.6"
  );
}
