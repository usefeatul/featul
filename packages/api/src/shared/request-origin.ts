import { HTTPException } from "hono/http-exception"

function isMutatingMethod(req: Request): boolean {
  const method = String(req.method || "").toUpperCase()
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE"
}

function toRegex(originPattern: string): RegExp | null {
  try {
    const trimmed = originPattern.trim()
    if (!trimmed) return null
    const hasWildcard = trimmed.includes("*")
    if (!hasWildcard) return new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
    const esc = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, ".*")
    return new RegExp(`^${esc}$`)
  } catch {
    return null
  }
}

function getPrivilegedOriginPatterns(): string[] {
  const explicit = String(process.env.API_TRUSTED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (explicit.length > 0) return explicit

  const fallback: string[] = []
  const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || "").trim()
  if (appUrl) {
    try {
      fallback.push(new URL(appUrl).origin)
    } catch { }
  }
  if (process.env.NODE_ENV !== "production") {
    fallback.push("http://localhost:3000")
    fallback.push("http://127.0.0.1:3000")
  }
  return Array.from(new Set(fallback))
}

function isPrivilegedOrigin(origin: string): boolean {
  const patterns = getPrivilegedOriginPatterns()
  for (const pattern of patterns) {
    const regex = toRegex(pattern)
    if (regex && regex.test(origin)) return true
  }
  return false
}

function parseOrigin(value: string): string | null {
  if (!value || value === "null") return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function enforceTrustedBrowserOrigin(req: Request): void {
  if (!isMutatingMethod(req)) return

  const requestOrigin = new URL(req.url).origin
  const origin = (req.headers.get("origin") || "").trim()
  const referer = (req.headers.get("referer") || "").trim()

  const incomingOrigin = parseOrigin(origin)
  if (incomingOrigin) {
    if (incomingOrigin === requestOrigin) return
    if (isPrivilegedOrigin(incomingOrigin)) return
    throw new HTTPException(403, { message: "Invalid request origin" })
  }

  const refererOrigin = parseOrigin(referer)
  if (refererOrigin) {
    if (refererOrigin === requestOrigin) return
    if (isPrivilegedOrigin(refererOrigin)) return
    throw new HTTPException(403, { message: "Invalid request origin" })
  }

  const secFetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase()
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    throw new HTTPException(403, { message: "Missing trusted request origin" })
  }
}
