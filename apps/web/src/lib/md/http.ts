import { absoluteUrl } from "@/config/seo"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
}

const CACHE_DYNAMIC = "public, s-maxage=3600, stale-while-revalidate=86400"
const CACHE_STATIC = "public, s-maxage=86400, stale-while-revalidate=604800"

type MarkdownResponseOptions = {
  /** Canonical HTML path; omit for site-level files. */
  canonicalPath?: string
  status?: number
  lastModified?: string
  static?: boolean
  contentType?: string
  head?: boolean
}

export function approxTokens(body: string) {
  return Math.ceil(body.length / 4)
}

export function markdownResponse(body: string, options: MarkdownResponseOptions = {}) {
  const text = body.endsWith("\n") ? body : `${body}\n`
  const headers = new Headers({
    ...CORS_HEADERS,
    "Content-Type": options.contentType ?? "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(approxTokens(text)),
    "X-Robots-Tag": "noindex, follow",
    Vary: "Accept",
    "Cache-Control": options.static ? CACHE_STATIC : CACHE_DYNAMIC,
  })
  if (options.canonicalPath) {
    const canonical = absoluteUrl(options.canonicalPath)
    headers.set("Content-Location", canonical)
    headers.set("Link", `<${canonical}>; rel="canonical"`)
  }
  if (options.lastModified) {
    const date = new Date(options.lastModified)
    if (!Number.isNaN(date.getTime())) headers.set("Last-Modified", date.toUTCString())
  }
  return new Response(options.head ? null : text, { status: options.status ?? 200, headers })
}

/** Site-level text files (llms.txt, llms-full.txt, ai.txt). Indexable, long cache. */
export function textResponse(body: string, head = false) {
  const text = body.endsWith("\n") ? body : `${body}\n`
  return new Response(head ? null : text, {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "text/plain; charset=utf-8",
      "X-Markdown-Tokens": String(approxTokens(text)),
      "Cache-Control": CACHE_STATIC,
    },
  })
}

export function markdownNotFound(path: string, head = false) {
  return markdownResponse(
    `# Not found\n\n> No Markdown page exists at ${absoluteUrl(path)}.\n\nSee ${absoluteUrl("/llms.txt")} for every available page.\n`,
    { status: 404, head },
  )
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: { ...CORS_HEADERS, "Access-Control-Max-Age": "86400" } })
}
