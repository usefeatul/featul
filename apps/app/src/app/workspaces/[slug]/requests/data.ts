import { getServerSession } from "@featul/auth/session"
import { getWorkspaceBySlug, getWorkspacePosts, getWorkspacePostsCount, normalizeStatus } from "@/lib/workspace"
import { toRequestItemData } from "@/lib/request-item"
import { parseArrayParam } from "@/utils/request"
import { parseSortOrder } from "@/types/sort"
import {
  getSingleSearchParam,
  normalizeSlugList,
  parsePositiveIntSearchParam,
} from "@/utils/search-params"
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
  const statusRaw = parseArrayParam(getSingleSearchParam(sp.status))
  const boardRaw = parseArrayParam(getSingleSearchParam(sp.board))
  const tagRaw = parseArrayParam(getSingleSearchParam(sp.tag))
  const order = parseSortOrder(typeof sp.order === "string" ? sp.order : undefined)
  const search = typeof sp.search === "string" ? sp.search : ""

  // Pagination
  const pageSize = PAGE_SIZE
  const page = parsePositiveIntSearchParam(sp.page)
  const offset = (page - 1) * pageSize

  // Process status filter (use defaults if none provided)
  const statusFilter = statusRaw.map(normalizeStatus)
  if (statusFilter.length === 0) {
    statusFilter.push(...DEFAULT_STATUSES)
  }

  // Process board/tag filters (clear boards when searching)
  const boardSlugs = search ? [] : normalizeSlugList(boardRaw)
  const tagSlugs = normalizeSlugList(tagRaw)

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
