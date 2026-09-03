import {
  LOW_INTERACTION_MAX_UPVOTES,
  LOW_INTERACTION_THRESHOLD_DAYS,
} from "@featul/api/shared/low-interaction"
import { STALE_RESOLVED_STATUSES } from "@featul/api/shared/stale"
import { getStaleDays } from "@/utils/request/stale"

export {
  LOW_INTERACTION_THRESHOLD_DAYS,
  LOW_INTERACTION_STATUS_KEY,
  LOW_INTERACTION_MAX_UPVOTES,
  isLowInteractionStatusFilter,
} from "@featul/api/shared/low-interaction"

const RESOLVED_STATUSES = new Set<string>(STALE_RESOLVED_STATUSES)

/** Prefer publish, then create — the clock starts when the post is submitted. */
export function getLowInteractionReferenceDate({
  publishedAt,
  createdAt,
}: {
  publishedAt?: string | null
  createdAt: string
}): Date {
  return new Date(publishedAt || createdAt)
}

/** Days since submit when the post still has no extra likes or comments. */
export function getRequestLowInteractionDays({
  roadmapStatus,
  publishedAt,
  createdAt,
  upvotes,
  commentCount,
  now,
}: {
  roadmapStatus?: string | null
  publishedAt?: string | null
  createdAt: string
  upvotes?: number | null
  commentCount?: number | null
  now?: Date
}): number | null {
  const status = (roadmapStatus || "").toLowerCase()
  if (RESOLVED_STATUSES.has(status)) return null
  if ((commentCount ?? 0) > 0) return null
  if ((upvotes ?? 0) > LOW_INTERACTION_MAX_UPVOTES) return null

  const days = getStaleDays(
    getLowInteractionReferenceDate({ publishedAt, createdAt }),
    now,
  )
  if (days < LOW_INTERACTION_THRESHOLD_DAYS) return null
  return days
}
