import { HTTPException } from "hono/http-exception"
import {
  getValidatedTrustedOrigins,
  isConfiguredTrustedOrigin,
} from "@featul/auth/trusted-origins"

function isMutatingMethod(req: Request): boolean {
  const method = String(req.method || "").toUpperCase()
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE"
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

function buildFallbackOriginPatterns(): string[] {
  const fallback: string[] = []
  const appUrl = String(process.env.NEXT_PUBLIC_APP_URL || "").trim()

  if (appUrl) {
    let parsed: URL | null = null
    try {
      parsed = new URL(appUrl)
    } catch {
      if (process.env.NODE_ENV === "production") {
        throw new Error("NEXT_PUBLIC_APP_URL must be a valid absolute URL in production")
      }
    }

    if (parsed) {
      if (process.env.NODE_ENV === "production") {
        if (parsed.protocol !== "https:") {
          throw new Error("NEXT_PUBLIC_APP_URL must use https:// in production")
        }
        if (isLocalDevHost(parsed.hostname)) {
          throw new Error("NEXT_PUBLIC_APP_URL cannot target localhost in production")
        }
      }

      fallback.push(parsed.origin)
      if (isLocalDevHost(parsed.hostname)) {
        const port = parsed.port ? `:${parsed.port}` : ""
        fallback.push(`${parsed.protocol}//*.localhost${port}`)
      }
    }
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

function getPrivilegedOriginPatterns(): string[] {
  const explicit = [
    ...getValidatedTrustedOrigins("API_TRUSTED_ORIGINS"),
    ...getValidatedTrustedOrigins("AUTH_TRUSTED_ORIGINS"),
  ]

  if (explicit.length > 0) return Array.from(new Set(explicit))
  return buildFallbackOriginPatterns()
}

const privilegedOriginPatterns = getPrivilegedOriginPatterns()

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
  if (isConfiguredTrustedOrigin(incomingOrigin, privilegedOriginPatterns)) return true

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
