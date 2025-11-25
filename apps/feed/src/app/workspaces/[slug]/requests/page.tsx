import type { Metadata } from "next"
import { getServerSession } from "@feedgot/auth/session"
import { notFound } from "next/navigation"
import { getWorkspaceBySlug, getWorkspacePosts, parseArrayParam, normalizeStatus } from "@/lib/workspace"
import RequestsHeader from "@/components/requests/RequestsHeader"
import RequestList from "@/components/requests/RequestList"
import { createPageMetadata } from "@/lib/seo"

export const dynamic = "force-dynamic"

type SearchParams = {
  status?: string | string[]
  board?: string | string[]
  tag?: string | string[]
  order?: string
  search?: string
}

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<SearchParams> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return createPageMetadata({
    title: "Requests",
    description: "Workspace requests",
    path: `/workspaces/${slug}/requests`,
    indexable: false,
  })
}


export default async function RequestsPage({ params, searchParams }: Props) {
  const { slug } = await params
  let sp: SearchParams = {}
  if (searchParams) {
    try {
      sp = await searchParams
    } catch {}
  }

  try {
    await getServerSession()
  } catch {}

  const ws = await getWorkspaceBySlug(slug)
  if (!ws) return notFound()

  const statusRaw = parseArrayParam((sp as any).status)
  const boardRaw = parseArrayParam((sp as any).board)
  const tagRaw = parseArrayParam((sp as any).tag)
  const order = typeof (sp as any).order === "string" && (sp as any).order ? (sp as any).order : "newest"
  const search = typeof (sp as any).search === "string" ? (sp as any).search : ""

  const statusFilter = statusRaw.map(normalizeStatus)
  if (statusFilter.length === 0) statusFilter.push("pending", "under-review", "planned", "in-progress")

  const boardSlugs = (search ? [] : boardRaw.map((b: string) => b.trim().toLowerCase())).filter(Boolean)
  const tagSlugs = tagRaw.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
  const rows = await getWorkspacePosts(slug, {
    statuses: statusFilter,
    boardSlugs,
    tagSlugs,
    order: order === "oldest" ? "oldest" : "newest",
    search,
  })

  return (
    <section className="space-y-4">
      <RequestsHeader selectedStatuses={statusRaw} />
      <div className="text-sm text-accent">{rows.length} items</div>
      <RequestList items={rows as any} workspaceSlug={slug} />
    </section>
  )
}
