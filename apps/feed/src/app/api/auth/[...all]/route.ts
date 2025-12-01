import { auth } from "@feedgot/auth/auth"
import { toNextJsHandler } from "better-auth/next-js"

const handler = toNextJsHandler(auth)

function toRegex(originPattern: string): RegExp | null {
  try {
    const trimmed = originPattern.trim()
    if (!trimmed) return null
    const hasWildcard = trimmed.includes("*")
    if (!hasWildcard) return new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
    const esc = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\*/g, "[^.]+")
    return new RegExp(`^${esc}$`)
  } catch {
    return null
  }
}

function isTrusted(origin: string): boolean {
  const raw = process.env.AUTH_TRUSTED_ORIGINS || ""
  const patterns = raw.split(",").map((s) => s.trim()).filter(Boolean)
  for (const p of patterns) {
    const r = toRegex(p)
    if (r && r.test(origin)) return true
  }
  return false
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, x-requested-with",
  }
}

function withCors(req: Request, res: Response): Response {
  const origin = req.headers.get("origin") || ""
  if (origin && isTrusted(origin)) {
    const h = new Headers(res.headers)
    const ch = corsHeaders(origin)
    Object.entries(ch).forEach(([k, v]) => h.set(k, v))
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
  }
  return res
}

export const OPTIONS = async (req: Request) => {
  const origin = req.headers.get("origin") || ""
  if (origin && isTrusted(origin)) {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }
  return new Response(null, { status: 204 })
}

export const GET = async (req: Request) => withCors(req, await handler.GET(req))
export const POST = async (req: Request) => withCors(req, await handler.POST(req))
