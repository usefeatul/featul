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
