import { getServerSession } from "@featul/auth/session"
import { getWorkspaceBySlug, getWorkspacePosts, getWorkspacePostsCount, normalizeStatus } from "@/lib/workspace"
import { parseArrayParam } from "@/utils/request-filters"

const PAGE_SIZE = 20

export type RequestsSearchParams = {
  status?: string | string[]
  board?: string | string[]
  tag?: string | string[]
  order?: string
  search?: string
  page?: string | string[]
}

export type RequestsPageData = {
  slug: string
  rows: unknown[]
  totalCount: number
  page: number
  pageSize: number
  statusFilter: string[]
  boardSlugs: string[]
  tagSlugs: string[]
  search: string
}

export async function loadRequestsPageData({
  slug,
  searchParams,
}: {
  slug: string
  searchParams?: RequestsSearchParams
}): Promise<RequestsPageData | null> {
  const sp = searchParams ?? {}

  try {
    await getServerSession()
  } catch {
    // Ignore session errors; page is still viewable
  }

  const ws = await getWorkspaceBySlug(slug)
  if (!ws) return null

  const statusRaw = parseArrayParam(pickSingle(sp.status))
  const boardRaw = parseArrayParam(pickSingle(sp.board))
  const tagRaw = parseArrayParam(pickSingle(sp.tag))
  const order = typeof sp.order === "string" && sp.order ? sp.order : "newest"
  const search = typeof sp.search === "string" ? sp.search : ""

  const pageSize = PAGE_SIZE
  const page = Math.max(Number(pickSingle(sp.page)) || 1, 1)
  const offset = (page - 1) * pageSize

  const statusFilter = statusRaw.map(normalizeStatus)
  if (statusFilter.length === 0) statusFilter.push("pending", "review", "planned", "progress")

  const boardSlugs = (search ? [] : boardRaw.map((b: string) => b.trim().toLowerCase())).filter(Boolean)
  const tagSlugs = tagRaw.map((t: string) => t.trim().toLowerCase()).filter(Boolean)

  const rows = await getWorkspacePosts(slug, {
    statuses: statusFilter,
    boardSlugs,
    tagSlugs,
    order: order === "oldest" ? "oldest" : "newest",
    search,
    limit: pageSize,
    offset,
  })

  const totalCount = await getWorkspacePostsCount(slug, {
    statuses: statusFilter,
    boardSlugs,
    tagSlugs,
    search,
  })

  return {
    slug,
    rows,
    totalCount,
    page,
    pageSize,
    statusFilter,
    boardSlugs,
    tagSlugs,
    search,
  }
}

function pickSingle(value?: string | string[]): string | null {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0] ?? null
  return null
}


