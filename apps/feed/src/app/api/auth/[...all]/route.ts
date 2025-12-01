import { auth } from "@feedgot/auth/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { db, workspace } from "@feedgot/db"
import { eq } from "drizzle-orm"

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

async function isTrusted(origin: string): Promise<boolean> {
  const raw = process.env.AUTH_TRUSTED_ORIGINS || ""
  const patterns = raw.split(",").map((s) => s.trim()).filter(Boolean)
  for (const p of patterns) {
    const r = toRegex(p)
    if (r && r.test(origin)) return true
  }
  try {
    const u = new URL(origin)
    const host = u.hostname
    if (!host) return false
    const [ws] = await db.select({ id: workspace.id }).from(workspace).where(eq(workspace.domain, host)).limit(1)
    if (ws?.id) return true
  } catch {}
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

async function withCors(req: Request, res: Response): Promise<Response> {
  const origin = req.headers.get("origin") || ""
  const trusted = await isTrusted(origin)
  if (origin && trusted) {
    const h = new Headers(res.headers)
    const ch = corsHeaders(origin)
    Object.entries(ch).forEach(([k, v]) => h.set(k, v))
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
  }
  return res
}

export const OPTIONS = async (req: Request) => {
  const origin = req.headers.get("origin") || ""
  if (origin && (await isTrusted(origin))) {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }
  return new Response(null, { status: 204 })
}

export const GET = async (req: Request) => withCors(req, await handler.GET(req))
export const POST = async (req: Request) => withCors(req, await handler.POST(req))
