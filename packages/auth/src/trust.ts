import { getValidatedTrustedOrigins, isConfiguredTrustedOrigin } from "./origins/trusted"

const configuredTrustedOrigins = getValidatedTrustedOrigins("AUTH_TRUSTED_ORIGINS")

export async function isTrustedOrigin(origin: string): Promise<boolean> {
  const value = String(origin || "").trim()
  if (!value) return false

  let normalizedOrigin: string
  try {
    const url = new URL(value)
    if (!url.hostname) return false
    normalizedOrigin = url.origin
  } catch {
    return false
  }

  if (process.env.NODE_ENV === "production" && !normalizedOrigin.startsWith("https://")) {
    return false
  }

  return isConfiguredTrustedOrigin(normalizedOrigin, configuredTrustedOrigins)
}

export function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, x-requested-with, accept, x-csrf-token",
    "Vary": "Origin",
  }
}

export async function buildTrustedOrigins(request: Request): Promise<string[]> {
  const list = [...configuredTrustedOrigins]
  const origin = request.headers.get("origin") || ""
  if (origin && (await isTrustedOrigin(origin))) list.push(origin)
  return Array.from(new Set(list))
}

export async function withCors(req: Request, res: Response): Promise<Response> {
  const origin = req.headers.get("origin") || ""
  const trusted = await isTrustedOrigin(origin)
  const h = new Headers(res.headers)
  if (req.headers.has("cookie") || req.headers.has("authorization")) h.set("Cache-Control", "private, no-store")
  // This outer boundary must also remove permissive headers from inner routers.
  for (const name of [...h.keys()]) {
    if (name.toLowerCase().startsWith("access-control-")) h.delete(name)
  }
  const vary = new Set((h.get("vary") || "").split(",").map(v => v.trim()).filter(Boolean))
  vary.add("Origin")
  h.set("Vary", [...vary].join(", "))
  if (origin && trusted) {
    const ch = corsHeaders(origin)
    Object.entries(ch).forEach(([k, v]) => { if (k !== "Vary") h.set(k, v) })
  }
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
}

export const handlePreflight = async (req: Request) => {
  const origin = req.headers.get("origin") || ""
  if (origin && (await isTrustedOrigin(origin))) {
    const h = new Headers(corsHeaders(origin))
    h.set("Access-Control-Max-Age", "600")
    return new Response(null, { status: 204, headers: h })
  }
  return new Response(null, { status: 204, headers: { Vary: "Origin" } })
}
