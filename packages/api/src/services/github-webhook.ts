import { createHmac, timingSafeEqual } from "node:crypto"
import { githubWebhookPayloadSchema, type GithubWebhookPayload } from "../validators/integration"
import { handleGithubIssueDeleted, syncWebhookIssue } from "./github-sync"

function normalizeHex(input: string): string {
  return input.startsWith("sha256=") ? input.slice(7) : input
}

export function verifyGithubWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = String(process.env.GITHUB_WEBHOOK_SECRET || "").trim()
  if (!secret || !signatureHeader) return false

  const providedHex = normalizeHex(String(signatureHeader || "").trim())
  if (!providedHex) return false

  const expectedHex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")

  const providedBuffer = Buffer.from(providedHex, "hex")
  const expectedBuffer = Buffer.from(expectedHex, "hex")
  if (providedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

function toIssue(payload: GithubWebhookPayload) {
  const issue = payload.issue
  if (!issue) return null
  return {
    id: String(issue.id),
    number: String(issue.number),
    title: String(issue.title || ""),
    body: String(issue.body || ""),
    htmlUrl: String(issue.html_url || ""),
    state: String(issue.state || "open").toLowerCase(),
    stateReason: issue.state_reason ? String(issue.state_reason) : null,
    updatedAt: issue.updated_at ? String(issue.updated_at) : null,
    labels: Array.isArray(issue.labels)
      ? issue.labels.map((label) => String(label?.name || "").trim().toLowerCase()).filter(Boolean)
      : [],
    isPullRequest: Boolean(issue.pull_request),
  }
}

export async function processGithubWebhookEvent(input: {
  db: any
  event: string
  payload: unknown
}): Promise<{ handled: boolean; result: string }> {
  if (String(input.event || "") !== "issues") {
    return { handled: false, result: "ignored_event" }
  }

  const payload = githubWebhookPayloadSchema.parse(input.payload)
  const action = String(payload.action || "").toLowerCase()
  const installationId = String(payload.installation?.id || "").trim()
  const repositoryId = String(payload.repository?.id || "").trim()
  const issueId = String(payload.issue?.id || "").trim()

  if (!installationId || !repositoryId || !issueId) {
    return { handled: false, result: "missing_identifiers" }
  }

  if (action === "deleted") {
    await handleGithubIssueDeleted({
      db: input.db,
      installationId,
      repositoryId,
      issueId,
    })
    return { handled: true, result: "deleted" }
  }

  const supported = new Set(["opened", "edited", "reopened", "closed", "labeled", "unlabeled"])
  if (!supported.has(action)) {
    return { handled: false, result: "ignored_action" }
  }

  const issue = toIssue(payload)
  if (!issue) {
    return { handled: false, result: "missing_issue" }
  }

  const syncResult = await syncWebhookIssue({
    db: input.db,
    installationId,
    repositoryId,
    issue,
  })

  return {
    handled: syncResult.status !== "not_connected",
    result: syncResult.result || syncResult.status,
  }
}
