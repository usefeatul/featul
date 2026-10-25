import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const WIDGET_FRAME_PATH = /^\/widget\/([a-zA-Z0-9_-]{1,128})\/frame\/?$/

/** Widget frame CSP. `frameAncestors` is the per-workspace embed allowlist. */
export function widgetContentSecurityPolicy(frameAncestors: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://www.youtube.com",
    `frame-ancestors ${frameAncestors}`,
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ")
}

export function widgetFrameProjectId(pathname: string): string | null {
  return WIDGET_FRAME_PATH.exec(pathname)?.[1] || null
}

/**
 * Serve the widget frame with `frame-ancestors` limited to the workspace's
 * allowed sites, so a page cannot embed it by lying about `parentOrigin`.
 * Lookup failures keep the static next.config policy (`frame-ancestors *`).
 */
export async function applyWidgetFrameHeaders(req: NextRequest) {
  const projectId = widgetFrameProjectId(req.nextUrl.pathname)
  if (!projectId) return null
  const response = NextResponse.next()
  try {
    const [{ db }, { loadWidgetAllowedOrigins, widgetFrameAncestors }] = await Promise.all([
      import("@featul/db"),
      import("@featul/api/widget-origins"),
    ])
    const origins = await loadWidgetAllowedOrigins(db, projectId)
    if (origins) {
      response.headers.set(
        "Content-Security-Policy",
        widgetContentSecurityPolicy(widgetFrameAncestors(origins)),
      )
    }
  } catch {
    /* keep the static widget CSP */
  }
  return response
}
