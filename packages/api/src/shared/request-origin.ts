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

function getOriginHost(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return ""
  }
}

function isLocalDevHost(host: string): boolean {
  if (!host) return false
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")
}

function isLocalDevOrigin(value: string): boolean {
  return isLocalDevHost(getOriginHost(value))
}

function splitOriginPatterns(value: string): string[] {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

function getPrivilegedOriginPatterns(): string[] {
  const explicit = [
    ...splitOriginPatterns(process.env.API_TRUSTED_ORIGINS || ""),
    ...splitOriginPatterns(process.env.AUTH_TRUSTED_ORIGINS || ""),
  ]
  if (explicit.length > 0) return Array.from(new Set(explicit))

  const fallback: string[] = []
  const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || "").trim()
  if (appUrl) {
    try {
      const parsed = new URL(appUrl)
      fallback.push(parsed.origin)
      if (isLocalDevHost(parsed.hostname)) {
        const port = parsed.port ? `:${parsed.port}` : ""
        fallback.push(`${parsed.protocol}//*.localhost${port}`)
      }
    } catch { }
  }
  if (process.env.NODE_ENV !== "production") {
    fallback.push("http://localhost:3000")
    fallback.push("http://127.0.0.1:3000")
    fallback.push("http://*.localhost:3000")
    fallback.push("https://localhost:3000")
    fallback.push("https://127.0.0.1:3000")
    fallback.push("https://*.localhost:3000")
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

function isTrustedIncomingOrigin(incomingOrigin: string, requestOrigin: string): boolean {
  if (incomingOrigin === requestOrigin) return true
  if (isPrivilegedOrigin(incomingOrigin)) return true

  // Local dev convenience: allow same-site localhost and *.localhost traffic.
  if (isLocalDevOrigin(requestOrigin) && isLocalDevOrigin(incomingOrigin)) {
    return true
  }

  return false
}

export function enforceTrustedBrowserOrigin(req: Request): void {
  if (!isMutatingMethod(req)) return

  const requestOrigin = new URL(req.url).origin
  const origin = (req.headers.get("origin") || "").trim()
  const referer = (req.headers.get("referer") || "").trim()

  const incomingOrigin = parseOrigin(origin)
  if (incomingOrigin) {
    if (isTrustedIncomingOrigin(incomingOrigin, requestOrigin)) return
    throw new HTTPException(403, { message: "Invalid request origin" })
  }

  const refererOrigin = parseOrigin(referer)
  if (refererOrigin) {
    if (isTrustedIncomingOrigin(refererOrigin, requestOrigin)) return
    throw new HTTPException(403, { message: "Invalid request origin" })
  }

  const secFetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase()
  if (secFetchSite === "same-site" && isLocalDevOrigin(requestOrigin)) return
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    throw new HTTPException(403, { message: "Missing trusted request origin" })
  }
}
