import { client } from "@featul/api/client"
import type { NotificationItem } from "@/components/subdomain/NotificationsPanel"

/** React Query keys for mention notifications. */
export const mentionsQueryKeys = {
  all: ["mentions"] as const,
  count: ["mentions", "count"] as const,
  list: ["mentions", "list"] as const,
}

/** Unwraps jstack `{ json }` envelopes from mention APIs. */
function unwrapPayload<T extends Record<string, unknown>>(raw: unknown): T | null {
  if (!raw || typeof raw !== "object") return null
  if ("json" in raw && raw.json && typeof raw.json === "object") {
    return raw.json as T
  }
  return raw as T
}

/** Unread mention count for the current user. */
export async function fetchMentionsUnreadCount(): Promise<number> {
  const res = await client.comment.mentionsCount.$get()
  const raw = await res.json().catch(() => null)
  const payload = unwrapPayload<{ unread?: number }>(raw)
  return Number(payload?.unread ?? 0)
}

/** Mention notification list for the current user. */
export async function fetchMentionsList(): Promise<NotificationItem[]> {
  const res = await client.comment.mentionsList.$get()
  const raw = await res.json().catch(() => null)
  const payload = unwrapPayload<{ notifications?: NotificationItem[] }>(raw)
  return Array.isArray(payload?.notifications) ? payload.notifications : []
}
