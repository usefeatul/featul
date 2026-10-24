import { getValidatedTrustedOrigins, isConfiguredTrustedOrigin, isExactTrustedOrigin } from "./origins/trusted"

const configuredTrustedOrigins = getValidatedTrustedOrigins("AUTH_TRUSTED_ORIGINS")

function isLocalDevHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")
}

export async function isTrustedOrigin(origin: string): Promise<boolean> {
  const value = String(origin || "").trim()
  if (!value) return false

  let url: URL
  try {
    url = new URL(value)
    if (!url.hostname) return false
  } catch {
    return false
  }
  const normalizedOrigin = url.origin

  if (process.env.NODE_ENV === "production" && !normalizedOrigin.startsWith("https://")) {
    return false
  }

  // Credentialed CORS can read sessions, so wildcard entries (https://*.featul.com) never get it:
  // script on any subdomain could. Tenant pages call their own origin, where the shared cookie applies.
  if (isExactTrustedOrigin(normalizedOrigin, configuredTrustedOrigins)) return true

  // Local dev serves tenants on *.localhost against the localhost app, without a shared cookie domain.
  return process.env.NODE_ENV !== "production" &&
    isLocalDevHost(url.hostname) &&
    isConfiguredTrustedOrigin(normalizedOrigin, configuredTrustedOrigins)
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
