import { j, privateProcedure } from "../jstack"
import { and, desc, eq } from "drizzle-orm"
import { user, session, board, workspace } from "@featul/db"
import { deleteAccountInputSchema, revokeSessionInputSchema } from "../validators/account"
import { HTTPException } from "hono/http-exception"

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
