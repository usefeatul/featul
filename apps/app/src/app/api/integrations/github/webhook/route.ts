import { db } from "@featul/db"
import { processGithubWebhookEvent, verifyGithubWebhookSignature } from "@featul/api/services/github-webhook"

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-hub-signature-256")

  if (!verifyGithubWebhookSignature(rawBody, signature)) {
    return Response.json({ ok: false, message: "Invalid webhook signature" }, { status: 401 })
  }

  const event = String(req.headers.get("x-github-event") || "")

  let payload: unknown = null
  try {
    payload = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    return Response.json({ ok: false, message: "Invalid JSON payload" }, { status: 400 })
  }

  try {
    const result = await processGithubWebhookEvent({
      db,
      event,
      payload,
    })

    return Response.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process webhook"
    return Response.json({ ok: false, message }, { status: 500 })
  }
}
