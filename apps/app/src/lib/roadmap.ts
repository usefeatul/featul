import type { SortOrder } from "@/types/sort";

export const ROADMAP_STATUSES = ["planned", "progress", "review", "completed", "pending", "closed"] as const

export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number]

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
  return sorted.sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.createdAt).getTime() -
      new Date(a.publishedAt ?? a.createdAt).getTime(),
  )
}
