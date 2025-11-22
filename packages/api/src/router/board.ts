import { eq, and } from "drizzle-orm"
import { j, publicProcedure } from "../jstack"
import { workspace, board, post } from "@feedgot/db"
import { checkSlugInputSchema } from "../validators/workspace"
import { byBoardInputSchema } from "../validators/board"

export function createBoardRouter() {
  return j.router({
    byWorkspaceSlug: publicProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ boards: [] })

        const boardsList = await ctx.db
          .select({
            id: board.id,
            name: board.name,
            slug: board.slug,
            type: board.type,
            description: board.description,
            isPublic: board.isPublic,
            allowAnonymous: board.allowAnonymous,
            allowVoting: board.allowVoting,
            allowComments: board.allowComments,
            roadmapStatuses: board.roadmapStatuses,
          })
          .from(board)
          .where(eq(board.workspaceId, ws.id))

        return c.superjson({ boards: boardsList })
      }),

    postsByBoard: publicProcedure
      .input(byBoardInputSchema)
      .get(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.superjson({ posts: [] })

        const [b] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.slug, input.boardSlug)))
          .limit(1)
        if (!b) return c.superjson({ posts: [] })

        const postsList = await ctx.db
          .select({
            id: post.id,
            title: post.title,
            slug: post.slug,
            upvotes: post.upvotes,
            roadmapStatus: post.roadmapStatus,
            publishedAt: post.publishedAt,
          })
          .from(post)
          .where(eq(post.boardId, b.id))

        return c.superjson({ posts: postsList })
      }),
  })
}