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

function getConfiguredOriginPatterns(): string[] {
  const raw = process.env.AUTH_TRUSTED_ORIGINS || ""
  return raw.split(",").map((s) => s.trim()).filter(Boolean)
}

function isOriginAllowedByConfig(origin: string): boolean {
  const patterns = getConfiguredOriginPatterns()
  for (const p of patterns) {
    const r = toRegex(p)
    if (r && r.test(origin)) return true
  }
  return false
}

export async function isTrustedOrigin(origin: string): Promise<boolean> {
  if (!origin) return false
  try {
    const u = new URL(origin)
    if (!u.hostname) return false
  } catch {
    return false
  }
  if (process.env.NODE_ENV === "production" && !origin.startsWith("https://")) {
    return false
  }
  return isOriginAllowedByConfig(origin)
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
  const list = getConfiguredOriginPatterns()
  const origin = request.headers.get("origin") || ""
  if (origin && (await isTrustedOrigin(origin))) list.push(origin)
  return Array.from(new Set(list))
}

export async function withCors(req: Request, res: Response): Promise<Response> {
  const origin = req.headers.get("origin") || ""
  const trusted = await isTrustedOrigin(origin)
  if (origin && trusted) {
    const h = new Headers(res.headers)
    const ch = corsHeaders(origin)
    Object.entries(ch).forEach(([k, v]) => h.set(k, v))
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
  }
  return res
}

export const handlePreflight = async (req: Request) => {
  const origin = req.headers.get("origin") || ""
  if (origin && (await isTrustedOrigin(origin))) {
    const h = new Headers(corsHeaders(origin))
    h.set("Access-Control-Max-Age", "600")
    return new Response(null, { status: 204, headers: h })
  }
  return new Response(null, { status: 204 })
}
