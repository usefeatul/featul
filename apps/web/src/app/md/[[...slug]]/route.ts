import { markdownResponse } from "@/lib/llms/response"
import { resolveMarkdown } from "@/lib/llms/content"
import { notFound } from "next/navigation"

type RouteParams = {
  slug?: string[]
}

export const revalidate = 86400

export async function GET(
  _request: Request,
  { params }: { params: Promise<RouteParams> },
) {
  const { slug } = await params
  const pathname = slug?.length ? `/${slug.join("/")}` : "/"
  const content = await resolveMarkdown(pathname)

  if (content == null) {
    notFound()
  }

  const describedBy = pathname.startsWith("/docs") ? "/docs/llms.txt" : "/llms.txt"
  return markdownResponse(content, describedBy)
}
