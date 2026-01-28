export interface SessionItem {
    token: string
    userAgent?: string | null
    ipAddress?: string | null
    createdAt?: string | Date
    expiresAt?: string | Date
}

export type SessionData = { session?: { token?: string }; token?: string } | null
