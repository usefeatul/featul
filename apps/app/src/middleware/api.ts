import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { getHostInfo } from "./host"

export const API_SUBDOMAIN = "api"

const DOCS_URL = "https://featul.com/docs/developers/api"

/**
 * `api.featul.com` (and `api.localhost` in dev) is the public REST API's address: `/v1/*`
 * rewrites onto the `/api/v1/*` route handlers, and app pages in the proxy matcher return a
 * JSON 404 instead of rendering. Paths outside the matcher (like `/api/*`) aren't intercepted,
 * so they behave as on any other host.
 */
export function rewriteApiHost(req: NextRequest, ctx: ReturnType<typeof getHostInfo>) {
  if (ctx.subdomain !== API_SUBDOMAIN) return null
  if (!ctx.isMainDomain && !ctx.isLocal) return null

  const { pathname } = ctx
  if (pathname === "/v1" || pathname.startsWith("/v1/")) {
    const url = req.nextUrl.clone()
    url.pathname = `/api${pathname}`
    return NextResponse.rewrite(url)
  }
  if (pathname === "/") {
    return NextResponse.json({ name: "Featul API", version: "v1", docs: DOCS_URL })
  }
  return NextResponse.json(
    { error: { code: "not_found", message: `No API route at ${pathname}. See ${DOCS_URL}` } },
    { status: 404 },
  )
}
