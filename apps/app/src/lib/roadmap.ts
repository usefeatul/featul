import type { SortOrder } from "@/types/sort";

export const ROADMAP_STATUSES = ["planned", "progress", "review", "completed", "pending", "closed"] as const

export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number]

export const ROADMAP_WIP_LIMITS: Partial<Record<RoadmapStatus, number>> = {
  progress: 8,
  review: 6,
}

export const ROADMAP_DEFAULT_COLLAPSED: Partial<Record<RoadmapStatus, boolean>> = {
  closed: true,
  pending: true,
}

export const ROADMAP_PAGE_SIZE = 150
export const ROADMAP_POLL_INTERVAL_MS = 45_000

const ROADMAP_STATUS_ALIASES: Record<string, RoadmapStatus> = {
  pending: "pending",
  review: "review",
  inreviewing: "review",
  planned: "planned",
  progress: "progress",
  inprogress: "progress",
  completed: "completed",
  closed: "closed",
}

export function normalizeRoadmapStatus(value?: string | null, fallback: RoadmapStatus = "pending"): RoadmapStatus {
  const raw = (value || "").trim().toLowerCase()
  if (!raw) return fallback
  const normalized = raw.replace(/[\s-]+/g, "")
  return ROADMAP_STATUS_ALIASES[normalized] ?? fallback
}

export function statusLabel(s: string) {
  const t = s.toLowerCase()
  if (t === "progress") return "Progress"
  if (t === "review") return "Review"
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function encodeCollapsed(collapsed: Record<string, boolean>): string {
  return ROADMAP_STATUSES.map((s) => (collapsed[s as string] ? "1" : "0")).join("")
}

export function groupItemsByStatus<T extends { roadmapStatus?: string | null }>(items: T[]) {
  const acc: Record<string, T[]> = {}
  for (const s of ROADMAP_STATUSES) acc[s as string] = []
  for (const it of items) {
    const key = normalizeRoadmapStatus(it.roadmapStatus)
    ;(acc[key] || (acc[key] = [])).push(it)
  }
  return acc
}

type SortableRoadmapItem = {
  upvotes: number
  publishedAt: string | null
  createdAt: string
  roadmapOrder?: number
}

export function sortRoadmapItems<T extends SortableRoadmapItem>(
  items: T[],
  order: SortOrder,
): T[] {
  const sorted = [...items]
  if (order === "likes") {
    return sorted.sort((a, b) => b.upvotes - a.upvotes)
  }
  if (order === "oldest") {
    return sorted.sort(
      (a, b) =>
        new Date(a.publishedAt ?? a.createdAt).getTime() -
        new Date(b.publishedAt ?? b.createdAt).getTime(),
    )
  }
  if (order === "newest") {
    return sorted.sort((a, b) => {
      const orderDiff = (a.roadmapOrder ?? 0) - (b.roadmapOrder ?? 0)
      if (orderDiff !== 0) return orderDiff
      return (
        new Date(b.publishedAt ?? b.createdAt).getTime() -
        new Date(a.publishedAt ?? a.createdAt).getTime()
      )
    })
  }
  return sorted.sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.createdAt).getTime() -
      new Date(a.publishedAt ?? a.createdAt).getTime(),
  )
}

export function groupItemsByBoard<T extends { boardSlug: string; boardName: string }>(
  items: T[],
): Array<{ boardSlug: string; boardName: string; items: T[] }> {
  const map = new Map<string, { boardSlug: string; boardName: string; items: T[] }>()
  for (const item of items) {
    const existing = map.get(item.boardSlug)
    if (existing) {
      existing.items.push(item)
      continue
    }
    map.set(item.boardSlug, {
      boardSlug: item.boardSlug,
      boardName: item.boardName,
      items: [item],
    })
  }
  return Array.from(map.values()).sort((a, b) => a.boardName.localeCompare(b.boardName))
}

export function buildRoadmapReorderUpdates<T extends { id: string; roadmapStatus?: string | null }>(
  status: string,
  orderedItems: T[],
) {
  return orderedItems.map((item, index) => ({
    postId: item.id,
    roadmapStatus: status,
    roadmapOrder: index,
  }))
}

type FilterableRoadmapItem = {
  title: string
  content: string | null
  boardName: string
  boardSlug: string
  tags?: Array<{ slug: string }>
}

export function filterRoadmapItems<T extends FilterableRoadmapItem>(
  items: T[],
  filters: { search: string; board: string[]; tag: string[] },
): T[] {
  let result = items
  const query = filters.search.trim().toLowerCase()

  if (query) {
    result = result.filter((item) => {
      const plainContent = (item.content || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
      return (
        item.title.toLowerCase().includes(query) ||
        plainContent.includes(query) ||
        item.boardName.toLowerCase().includes(query)
      )
    })
  }

  if (filters.board.length) {
    result = result.filter((item) => filters.board.includes(item.boardSlug))
  }

  if (filters.tag.length) {
    result = result.filter((item) =>
      (item.tags || []).some((tag) => filters.tag.includes(tag.slug)),
    )
  }

  return result
}
