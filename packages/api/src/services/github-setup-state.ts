import { createHmac, timingSafeEqual } from "node:crypto"
import { HTTPException } from "hono/http-exception"

type GithubSetupStatePayload = {
  workspaceSlug: string
  userId: string
  issuedAt: number
}

function getGithubStateSecret(): string {
  const secret = String(
    process.env.GITHUB_SETUP_STATE_SECRET
    || process.env.AUTH_SECRET
    || process.env.GITHUB_WEBHOOK_SECRET
    || ""
  ).trim()
  if (!secret) {
    throw new HTTPException(500, {
      message: "Missing state signing secret. Set GITHUB_SETUP_STATE_SECRET or AUTH_SECRET",
    })
  }
  return secret
}

function encodeStatePayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload)
  return Buffer.from(json, "utf8").toString("base64url")
}

function decodeStatePayload(encoded: string): Record<string, unknown> | null {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8")
    const parsed = JSON.parse(json)
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

function signSetupState(encodedPayload: string): string {
  const secret = getGithubStateSecret()
  return createHmac("sha256", secret).update(encodedPayload, "utf8").digest("base64url")
}

export function createSetupState(payload: GithubSetupStatePayload): string {
  const encoded = encodeStatePayload(payload)
  const signature = signSetupState(encoded)
  return `${encoded}.${signature}`
}

export function verifySetupState(state: string): GithubSetupStatePayload {
  const parts = String(state || "").trim().split(".")
  if (parts.length !== 2) {
    throw new HTTPException(400, { message: "Invalid GitHub setup state" })
  }

  const encodedPayload = String(parts[0] || "")
  const providedSignature = String(parts[1] || "")
  const expectedSignature = signSetupState(encodedPayload)

  const providedBuffer = Buffer.from(providedSignature || "", "base64url")
  const expectedBuffer = Buffer.from(expectedSignature, "base64url")
  if (
    providedBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    throw new HTTPException(400, { message: "Invalid GitHub setup state signature" })
  }

  const payload = decodeStatePayload(encodedPayload)
  const workspaceSlug = String(payload?.workspaceSlug || "").trim()
  const userId = String(payload?.userId || "").trim()
  const issuedAt = Number(payload?.issuedAt || 0)

  if (!workspaceSlug || !userId || !Number.isFinite(issuedAt)) {
    throw new HTTPException(400, { message: "Invalid GitHub setup state payload" })
  }

  const stateTtlMs = 30 * 60 * 1000
  if (Date.now() - issuedAt > stateTtlMs) {
    throw new HTTPException(400, { message: "GitHub setup state expired" })
  }

  return { workspaceSlug, userId, issuedAt }
}

export type { GithubSetupStatePayload }
