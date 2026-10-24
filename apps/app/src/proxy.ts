import type { NextRequest } from "next/server"
import { middleware as proxyMiddleware } from "./middleware/proxy"
import { applyWidgetFrameHeaders } from "./middleware/widget"

export async function proxy(req: NextRequest) {
  // The widget frame is host-agnostic: never apply subdomain/auth rewrites to it.
  const widget = await applyWidgetFrameHeaders(req)
  if (widget) return widget
  return proxyMiddleware(req)
}

export const config = {
  matcher: [
    "/",
    "/roadmap",
    "/changelog",
    "/changelog/:path*",
    "/help",
    "/help/:path*",
    "/workspaces/:path*",
    "/auth/:path*",
    "/start",
    "/notifications",
    "/reserve",
    "/board/:path*",
    "/widget/:projectId/frame",
  ],
}
