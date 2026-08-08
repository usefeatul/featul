import { HTTPException } from "hono/http-exception"

let openRouterClient: import("@openrouter/sdk").OpenRouter | null = null

async function getOpenRouterClient() {
  const { OpenRouter } = await import("@openrouter/sdk")
  const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim()
  if (!apiKey) {
    throw new HTTPException(500, { message: "Missing OpenRouter env: OPENROUTER_API_KEY" })
  }
  if (!openRouterClient) {
    openRouterClient = new OpenRouter({ apiKey })
  }
  return openRouterClient
}

export async function sendOpenRouterChat(request: any) {
  const client = await getOpenRouterClient()
  return client.chat.send(request)
}

function getOpenRouterHeaders() {
  const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim()
  if (!apiKey) {
    throw new HTTPException(500, { message: "Missing OpenRouter env: OPENROUTER_API_KEY" })
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  }

  const referer = String(process.env.OPENROUTER_REFERER || "").trim()
  const appName = String(process.env.OPENROUTER_APP_NAME || "").trim()
  if (referer) headers["HTTP-Referer"] = referer
  if (appName) headers["X-Title"] = appName

  return headers
}

export async function streamOpenRouterChat(
  request: Record<string, unknown>,
  onDelta: (text: string) => void,
) {
  const headers = getOpenRouterHeaders()
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({ ...request, stream: true }),
  })

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "")
    throw new HTTPException(res.status as 400, {
      message: errorBody || "OpenRouter request failed",
    })
  }

  if (!res.body) {
    throw new HTTPException(500, { message: "OpenRouter stream was empty" })
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    let boundary = buffer.indexOf("\n\n")
    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      boundary = buffer.indexOf("\n\n")

      for (const line of chunk.split("\n")) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("data:")) continue

        const payload = trimmed.slice(5).trim()
        if (!payload || payload === "[DONE]") continue

        try {
          const parsed = JSON.parse(payload) as {
            choices?: Array<{ delta?: { content?: string | null } }>
          }
          const text = parsed.choices?.[0]?.delta?.content
          if (typeof text === "string" && text.length > 0) {
            onDelta(text)
          }
        } catch {
          // Ignore malformed SSE chunks.
        }
      }
    }
  }
}

export function resolveOpenRouterStreamModel(action: string) {
  const streamModel = String(process.env.OPENROUTER_STREAM_MODEL || "").trim()
  if (streamModel) return streamModel

  const configuredModel = String(process.env.OPENROUTER_MODEL || "").trim()
  if (configuredModel && configuredModel !== "openrouter/auto") {
    return configuredModel
  }

  if (action === "generateFromPosts" || action === "prompt") {
    return "google/gemini-2.0-flash-001"
  }

  return configuredModel || "google/gemini-2.0-flash-001"
}
