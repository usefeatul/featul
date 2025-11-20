import { HTTPException } from "hono/http-exception"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { workspace, workspaceMember } from "@feedgot/db"

export function createWorkspaceRouter(j: any, privateProcedure: any) {
  const slugSchema = z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, or hyphens")

  const createInput = z.object({
    name: z.string().min(1).max(64),
    domain: z.string().url(),
    slug: slugSchema,
    timezone: z.string().min(1),
  })

  return j.router({
    checkSlug: privateProcedure
      .input(z.object({ slug: slugSchema }))
      .mutation(async ({ ctx, input, c }: any) => {
        const existing = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        return c.json({ available: existing.length === 0 })
      }),

    exists: privateProcedure.query(async ({ ctx, c }: any) => {
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
      .input(createInput)
      .mutation(async ({ ctx, input, c }: any) => {
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