import {
  STALE_THRESHOLD_DAYS,
  STALE_RESOLVED_STATUSES,
} from "@featul/api/shared/stale"

export {
  STALE_THRESHOLD_DAYS,
  STALE_STATUS_KEY,
  STALE_RESOLVED_STATUSES,
  isStaleStatusFilter,
} from "@featul/api/shared/stale"

const RESOLVED_STATUSES = new Set<string>(STALE_RESOLVED_STATUSES)

/** Prefer last edit, then publish, then create as the stale clock. */
export function getStaleReferenceDate({
  updatedAt,
  publishedAt,
  createdAt,
}: {
  updatedAt?: string | null
  publishedAt?: string | null
  createdAt: string
}): Date {
  const raw = updatedAt || publishedAt || createdAt
  return new Date(raw)
}

/** Whole days since `reference`. Negative or invalid spans count as 0. */
export function getStaleDays(reference: Date, now = new Date()): number {
  const ms = now.getTime() - reference.getTime()
  if (!Number.isFinite(ms) || ms < 0) return 0
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

/** Days over the stale threshold, or null if resolved / still fresh. */
export function getRequestStaleDays({
  roadmapStatus,
  updatedAt,
  publishedAt,
  createdAt,
  now,
}: {
  roadmapStatus?: string | null
  updatedAt?: string | null
  publishedAt?: string | null
  createdAt: string
  now?: Date
}): number | null {
  const status = (roadmapStatus || "").toLowerCase()
  if (RESOLVED_STATUSES.has(status)) return null

  const days = getStaleDays(
    getStaleReferenceDate({ updatedAt, publishedAt, createdAt }),
    now,
  )
  if (days < STALE_THRESHOLD_DAYS) return null
  return days
}
