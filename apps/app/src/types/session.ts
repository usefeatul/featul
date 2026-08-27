/** Account session row; isCurrent marks the device making the request. */
export interface SessionItem {
    id: string
    isCurrent: boolean
    userAgent?: string | null
    ipAddress?: string | null
    createdAt?: string | Date
    expiresAt?: string | Date
}

/** Dual-shape better-auth token (nested session.token or top-level token). */
export type SessionData = { session?: { token?: string }; token?: string } | null
