import { HTTPException } from "hono/http-exception"
import { eq } from "drizzle-orm"
import { j, privateProcedure } from "../jstack"
import { workspace, workspaceMember } from "@feedgot/db"
import { createWorkspaceInputSchema, checkSlugInputSchema } from "../validators/workspace"

export function createWorkspaceRouter() {
  return j.router({
    checkSlug: privateProcedure
      .input(checkSlugInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const existing = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        return c.json({ available: existing.length === 0 })
      }),

    exists: privateProcedure.get(async ({ ctx, c }: any) => {
      const userId = ctx.session.user.id
      const owned = await ctx.db
        .select({ id: workspace.id })
        .from(workspace)
        .where(eq(workspace.ownerId, userId))
        .limit(1)
      const member = await ctx.db
        .select({ id: workspaceMember.id })
        .from(workspaceMember)
        .where(eq(workspaceMember.userId, userId))
        .limit(1)
      return c.json({ hasWorkspace: owned.length > 0 || member.length > 0 })
    }),

    create: privateProcedure
      .input(createWorkspaceInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const slug = input.slug.toLowerCase()
        const exists = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, slug))
          .limit(1)
        if (exists.length > 0) {
          throw new HTTPException(409, { message: "Slug is already taken" })
        }

        const [created] = await ctx.db
          .insert(workspace)
          .values({
            name: input.name.trim(),
            slug,
            domain: input.domain.trim(),
            ownerId: ctx.session.user.id,
            timezone: input.timezone,
          })
          .returning()

        await ctx.db.insert(workspaceMember).values({
          workspaceId: created.id,
          userId: ctx.session.user.id,
          role: "admin",
          permissions: {
            canManageWorkspace: true,
            canManageBilling: true,
            canManageMembers: true,
            canManageBoards: true,
            canModerateAllBoards: true,
            canConfigureBranding: true,
          },
          joinedAt: new Date(),
        })

        return c.superjson({ workspace: created })
      }),
  })
}