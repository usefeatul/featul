import { OpenRouter } from "@openrouter/sdk"
import { HTTPException } from "hono/http-exception"

let openRouterClient: OpenRouter | null = null

function getOpenRouterClient() {
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
  const client = getOpenRouterClient()
  return client.chat.send(request)
}

export async function streamOpenRouterChat(
  request: Record<string, unknown>,
  onDelta: (text: string) => void | Promise<void>,
) {
  const client = getOpenRouterClient()
  const stream = await client.chat.send({
    ...request,
    stream: true,
  } as Parameters<typeof client.chat.send>[0])

  for await (const chunk of stream as AsyncIterable<{
    choices?: Array<{ delta?: { content?: string | null } }>
  }>) {
    const text = chunk.choices?.[0]?.delta?.content
    if (typeof text === "string" && text.length > 0) {
      await onDelta(text)
    }
  }
}
