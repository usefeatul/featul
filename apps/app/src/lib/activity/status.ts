import {
  normalizeActivityStatus,
  readActivityStatus,
} from "@featul/api/shared/member-activity"
import type { ActivityItem } from "@/types/activity"

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getActivityStatus(
  item: Pick<ActivityItem, "status" | "metadata">,
): string | null {
  const directStatus = normalizeActivityStatus(item.status)
  if (directStatus) return directStatus

  return readActivityStatus(item.metadata)
}

export function formatActivityStatusLabel(status: unknown): string | null {
  const normalized = normalizeActivityStatus(status)
  if (!normalized) return null
  if (normalized === "progress") return "Progress"
  if (normalized === "review") return "Review"
  return toTitleCase(normalized.replace(/[_-]+/g, " "))
}
