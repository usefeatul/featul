import { j, privateProcedure } from "../jstack"
import { and, desc, eq } from "drizzle-orm"
import { user, session, board, workspace } from "@featul/db"
import {
    deleteAccountInputSchema,
    revokeSessionInputSchema,
    switchDeviceAccountInputSchema,
} from "../validators/account"
import { HTTPException } from "hono/http-exception"
import { auth } from "@featul/auth/auth"
import { splitSetCookieHeader } from "better-auth/cookies"

type DeviceSessionEntry = {
    session?: {
        token?: string | null
    } | null
    user?: {
        id?: string | null
        name?: string | null
        email?: string | null
        image?: string | null
    } | null
}

function getRawHeaders(c: any): Headers {
    const raw = c?.req?.raw?.headers || c?.request?.headers
    if (raw instanceof Headers) return raw
    return new Headers(raw || {})
}

function parseDeviceSessions(value: unknown): DeviceSessionEntry[] {
    if (!Array.isArray(value)) return []
    return value as DeviceSessionEntry[]
}

function appendSetCookieHeaders(c: any, headers: Headers): void {
    const cookies =
        typeof (headers as any).getSetCookie === "function"
            ? ((headers as any).getSetCookie() as string[])
            : splitSetCookieHeader(headers.get("set-cookie") || "")

    for (const cookie of cookies) {
        if (!cookie) continue
        c.header("set-cookie", cookie, { append: true })
    }
}

export function createAccountRouter() {
    return j.router({
        listSessions: privateProcedure
            .get(async ({ ctx, c }) => {
                const userId = ctx.session.user.id
                const currentToken = String((ctx.session as any)?.session?.token || "")

                const rows = await ctx.db
                    .select({
                        id: session.id,
                        token: session.token,
                        userAgent: session.userAgent,
                        ipAddress: session.ipAddress,
                        createdAt: session.createdAt,
                        expiresAt: session.expiresAt,
                    })
                    .from(session)
                    .where(eq(session.userId, userId))
                    .orderBy(desc(session.createdAt))

                const sessions = rows.map((row: (typeof rows)[number]) => ({
                    id: String(row.id),
                    isCurrent: Boolean(currentToken) && String(row.token) === currentToken,
                    userAgent: row.userAgent || null,
                    ipAddress: row.ipAddress || null,
                    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : undefined,
                    expiresAt: row.expiresAt instanceof Date ? row.expiresAt.toISOString() : undefined,
                }))

                return c.superjson({ sessions })
            }),

        listDeviceAccounts: privateProcedure
            .get(async ({ ctx, c }) => {
                const rawHeaders = getRawHeaders(c)
                const currentUserId = String(ctx.session.user.id || "").trim()
                const currentToken = String((ctx.session as any)?.session?.token || "").trim()
                const currentName = String(
                    ctx.session.user.name || ctx.session.user.email || "Account",
                ).trim() || "Account"
                const currentImage = typeof ctx.session.user.image === "string"
                    ? ctx.session.user.image
                    : ""

                const listResult = await auth.api.listDeviceSessions({
                    headers: rawHeaders,
                }).catch(() => [])
                const deviceSessions = parseDeviceSessions(listResult)

                const seenUserIds = new Set<string>()
                const accounts = deviceSessions
                    .map((entry) => {
                        const userId = String(entry?.user?.id || "").trim()
                        const sessionToken = String(entry?.session?.token || "").trim()
                        if (!userId || !sessionToken || seenUserIds.has(userId)) return null
                        seenUserIds.add(userId)

                        const email = String(entry?.user?.email || "").trim()
                        const fallbackName = email ? email.split("@")[0] : "Account"
                        const name = String(entry?.user?.name || fallbackName || "Account").trim() || "Account"
                        const image = typeof entry?.user?.image === "string" ? entry.user.image : ""

                        return {
                            userId,
                            name,
                            image,
                            isCurrent: userId === currentUserId || (Boolean(currentToken) && sessionToken === currentToken),
                        }
                    })
                    .filter((entry): entry is { userId: string; name: string; image: string; isCurrent: boolean } => Boolean(entry))

                if (!accounts.some((account) => account.isCurrent)) {
                    accounts.unshift({
                        userId: currentUserId || "__current__",
                        name: currentName,
                        image: currentImage,
                        isCurrent: true,
                    })
                }

                return c.superjson({ accounts })
            }),

        bootstrapDeviceSession: privateProcedure
            .post(async ({ c }) => {
                const rawHeaders = getRawHeaders(c)
                const bootstrapResult = (await (auth.api as any).bootstrapCurrentDeviceSession({
                    headers: rawHeaders,
                    returnHeaders: true,
                })) as { headers?: Headers }

                if (bootstrapResult.headers instanceof Headers) {
                    appendSetCookieHeaders(c, bootstrapResult.headers)
                }

                return c.superjson({ success: true })
            }),

        switchDeviceAccount: privateProcedure
            .input(switchDeviceAccountInputSchema)
            .post(async ({ ctx, input, c }) => {
                const targetUserId = String(input.userId || "").trim()
                if (!targetUserId) {
                    throw new HTTPException(400, { message: "User id is required" })
                }

                const currentUserId = String(ctx.session.user.id || "").trim()
                if (targetUserId === currentUserId) {
                    return c.superjson({
                        success: true,
                        switchedToUserId: currentUserId,
                    })
                }

                const rawHeaders = getRawHeaders(c)
                const listResult = await auth.api.listDeviceSessions({
                    headers: rawHeaders,
                }).catch(() => [])
                const deviceSessions = parseDeviceSessions(listResult)

                const target = deviceSessions.find(
                    (entry) => String(entry?.user?.id || "").trim() === targetUserId,
                )
                const targetSessionToken = String(target?.session?.token || "").trim()

                if (!targetSessionToken) {
                    throw new HTTPException(404, { message: "Connected account not found" })
                }

                const switchResult = (await auth.api.setActiveSession({
                    headers: rawHeaders,
                    body: {
                        sessionToken: targetSessionToken,
                    },
                    returnHeaders: true,
                })) as { headers?: Headers; response?: unknown }

                if (switchResult.headers instanceof Headers) {
                    appendSetCookieHeaders(c, switchResult.headers)
                }

                return c.superjson({
                    success: true,
                    switchedToUserId: targetUserId,
                })
            }),

        revokeSession: privateProcedure
            .input(revokeSessionInputSchema)
            .post(async ({ ctx, input, c }) => {
                const userId = ctx.session.user.id
                const currentToken = String((ctx.session as any)?.session?.token || "")

                const [target] = await ctx.db
                    .select({ id: session.id, token: session.token })
                    .from(session)
                    .where(and(eq(session.id, input.sessionId), eq(session.userId, userId)))
                    .limit(1)

                if (!target) {
                    throw new HTTPException(404, { message: "Session not found" })
                }

                const revokedCurrentSession = Boolean(currentToken) && String(target.token) === currentToken

                await ctx.db.delete(session).where(eq(session.id, target.id))

                return c.superjson({ success: true, revokedCurrentSession })
            }),

        delete: privateProcedure
            .input(deleteAccountInputSchema)
            .post(async ({ ctx, c }) => {
                const userId = ctx.session.user.id

                // Delete all sessions for this user first
                await ctx.db.delete(session).where(eq(session.userId, userId))

                // Delete boards created by this user (board.createdBy doesn't have cascade delete)
                await ctx.db.delete(board).where(eq(board.createdBy, userId))

                // Delete workspaces owned by this user (will cascade to boards, posts, etc.)
                await ctx.db.delete(workspace).where(eq(workspace.ownerId, userId))

                // Delete the user (cascades to remaining related data via foreign keys)
                await ctx.db.delete(user).where(eq(user.id, userId))

                return c.json({ success: true })
            }),
    })
}
