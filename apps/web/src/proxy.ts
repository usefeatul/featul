import { NextResponse, type NextRequest } from "next/server"
import { prefersMarkdown } from "@/lib/md/negotiate"
import {
  htmlPathToMarkdownPath,
  markdownPathToHtmlPath,
  matchMarkdownPattern,
  normalizeContentPath,
} from "@/lib/md/patterns"

const SITE_FILES_LINK = [
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</llms-full.txt>; rel="describedby"; type="text/plain"',
  '</ai.txt>; rel="describedby"; type="text/plain"',
].join(", ")

function markdownApiUrl(request: NextRequest, htmlPath: string) {
  const url = request.nextUrl.clone()
  url.pathname = htmlPath === "/" ? "/api/md" : `/api/md${htmlPath}`
  return url
}

/**
 * Markdown twins for AI agents:
 * - `/pricing.md`, `/index.md` → `/api/md/...` (unknown `.md` paths get a Markdown 404)
 * - `Accept: text/markdown` on an allowlisted content route → the same handler
 * - every content route advertises its twin and the site-level files in `Link`
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.endsWith(".md")) {
    return NextResponse.rewrite(markdownApiUrl(request, markdownPathToHtmlPath(pathname)))
  }

  const htmlPath = normalizeContentPath(pathname)
  if (!matchMarkdownPattern(htmlPath)) return NextResponse.next()

  if (prefersMarkdown(request.headers.get("accept"))) {
    const response = NextResponse.rewrite(markdownApiUrl(request, htmlPath))
    response.headers.set("Vary", "Accept")
    return response
  }

  const response = NextResponse.next()
  response.headers.set("Vary", "Accept")
  response.headers.set(
    "Link",
    `<${htmlPathToMarkdownPath(htmlPath)}>; rel="alternate"; type="text/markdown", ${SITE_FILES_LINK}`,
  )
  return response
}

export const config = {
  // Pages and `.md` twins only: skip Next internals, API routes, well-known
  // files, and anything else with a file extension (llms.txt, robots.txt,
  // sitemap.xml, images, feeds).
  matcher: ["/((?!_next/|api/|\\.well-known/)(?:[^.]*|.*\\.md))"],
}
