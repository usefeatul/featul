import { j, privateProcedure } from "../jstack"
import { eq } from "drizzle-orm"
import { user, session, board, workspace } from "@featul/db"
import { deleteAccountInputSchema } from "../validators/account"

export function createAccountRouter() {
    return j.router({
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
