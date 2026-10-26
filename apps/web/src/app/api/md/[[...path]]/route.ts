import { absoluteUrl } from "@/config/seo"
import { markdownNotFound, markdownResponse, optionsResponse } from "@/lib/md/http"
import { htmlPathToMarkdownPath } from "@/lib/md/patterns"
import { listMarkdownRoutes, resolveMarkdown } from "@/lib/md/registry"

type RouteParams = {
  path?: string[]
}

type RouteContext = { params: Promise<RouteParams> }

/** Every public page's Markdown twin. `.md` URLs and `Accept: text/markdown` are rewritten here by `src/proxy.ts`. */
async function handle(context: RouteContext, head: boolean) {
  const { path } = await context.params
  const pathname = path?.length ? `/${path.join("/")}` : "/"

  if (pathname === "/_catalog") {
    const routes = await listMarkdownRoutes()
    const catalog = routes.map((entry) => ({
      title: entry.title,
      description: entry.description,
      section: entry.section,
      html: absoluteUrl(entry.path),
      markdown: absoluteUrl(htmlPathToMarkdownPath(entry.path) ?? entry.path),
    }))
    return Response.json(
      { count: catalog.length, routes: catalog },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
          "X-Robots-Tag": "noindex, follow",
        },
      },
    )
  }

  const resolved = await resolveMarkdown(pathname)
  if (!resolved) return markdownNotFound(pathname, head)

  return markdownResponse(resolved.markdown, {
    canonicalPath: resolved.doc.path,
    lastModified: resolved.doc.updated,
    static: resolved.route.static,
    head,
  })
}

export function GET(_request: Request, context: RouteContext) {
  return handle(context, false)
}

export function HEAD(_request: Request, context: RouteContext) {
  return handle(context, true)
}

export function OPTIONS() {
  return optionsResponse()
}
