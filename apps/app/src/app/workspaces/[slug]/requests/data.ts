import { getServerSession } from "@featul/auth/session"
import { getWorkspaceBySlug, getWorkspacePosts, getWorkspacePostsCount, normalizeStatus } from "@/lib/workspace"
import { toRequestItemData } from "@/lib/request-item"
import { parseArrayParam } from "@/utils/request"
import { parseSortOrder } from "@/types/sort"
import type { RequestItemData } from "@/types/request"

const PAGE_SIZE = 20

/** Default statuses to show when no filter is applied */
const DEFAULT_STATUSES = ["pending", "review", "planned", "progress"] as const

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
  rows: RequestItemData[]
  totalCount: number
  page: number
  pageSize: number
  statusFilter: string[]
  boardSlugs: string[]
  tagSlugs: string[]
  search: string
  isWorkspaceOwner: boolean
}

/** Extract a single string value from a string or string array */
function pickSingle(value?: string | string[]): string | null {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value[0] ?? null
  return null
}

/** Normalize and filter slug arrays */
function normalizeSlugArray(items: string[]): string[] {
  return items.map((s) => s.trim().toLowerCase()).filter(Boolean)
}

export async function loadRequestsPageData({
  slug,
  searchParams,
}: {
  slug: string
  searchParams?: RequestsSearchParams
}): Promise<RequestsPageData | null> {
  const sp = searchParams ?? {}

  // Session check (non-blocking, page is still viewable without auth)
  let userId: string | null = null
  try {
    const session = await getServerSession()
    userId = session?.user?.id || null
  } catch {
    // Ignore session errors; page is still viewable
  }


  const ws = await getWorkspaceBySlug(slug)
  if (!ws) return null

  const isOwner = userId === ws.ownerId

  // Parse filter parameters
  const statusRaw = parseArrayParam(pickSingle(sp.status))
  const boardRaw = parseArrayParam(pickSingle(sp.board))
  const tagRaw = parseArrayParam(pickSingle(sp.tag))
  const order = parseSortOrder(typeof sp.order === "string" ? sp.order : undefined)
  const search = typeof sp.search === "string" ? sp.search : ""

  // Pagination
  const pageSize = PAGE_SIZE
  const page = Math.max(Number(pickSingle(sp.page)) || 1, 1)
  const offset = (page - 1) * pageSize

  // Process status filter (use defaults if none provided)
  const statusFilter = statusRaw.map(normalizeStatus)
  if (statusFilter.length === 0) {
    statusFilter.push(...DEFAULT_STATUSES)
  }

  // Process board/tag filters (clear boards when searching)
  const boardSlugs = search ? [] : normalizeSlugArray(boardRaw)
  const tagSlugs = normalizeSlugArray(tagRaw)

  // Fetch data
  const [rows, totalCount] = await Promise.all([
    getWorkspacePosts(slug, {
      statuses: statusFilter,
      boardSlugs,
      tagSlugs,
      order,
      search,
      limit: pageSize,
      offset,
      includeReportCounts: isOwner,
    }),
    getWorkspacePostsCount(slug, {
      statuses: statusFilter,
      boardSlugs,
      tagSlugs,
      search,
    }),
  ])

  return {
    slug,
    rows: rows.map(toRequestItemData),
    totalCount,
    page,
    pageSize,
    statusFilter,
    boardSlugs,
    tagSlugs,
    search,
    isWorkspaceOwner: isOwner,
  }
}
