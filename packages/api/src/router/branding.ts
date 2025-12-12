import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { j, privateProcedure, publicProcedure } from "../jstack"
import { workspace, brandingConfig, workspaceMember } from "@oreilla/db"
import { checkSlugInputSchema } from "../validators/workspace"
import { updateBrandingInputSchema } from "../validators/branding"
import { getPlanLimits } from "../shared/plan"

export function createBrandingRouter() {
  return j.router({
    byWorkspaceSlug: publicProcedure
      .input(checkSlugInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [row] = await ctx.db
          .select({
            id: brandingConfig.id,
            // expose current workspace logo for convenience
            logoUrl: workspace.logo,
            primaryColor: brandingConfig.primaryColor,
            theme: brandingConfig.theme,
            showLogo: brandingConfig.showLogo,
            showWorkspaceName: brandingConfig.showWorkspaceName,
            hidePoweredBy: brandingConfig.hidePoweredBy,
            layoutStyle: brandingConfig.layoutStyle,
            sidebarPosition: brandingConfig.sidebarPosition,
          })
          .from(workspace)
          .leftJoin(brandingConfig, eq(brandingConfig.workspaceId, workspace.id))
          .where(eq(workspace.slug, input.slug))
          .limit(1)

        c.header("Cache-Control", "public, max-age=30, stale-while-revalidate=300")
        return c.superjson({ config: row || null })
      }),

    update: privateProcedure
      .input(updateBrandingInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, plan: workspace.plan, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) return c.json({ ok: false })
        let allowed = ws.ownerId === ctx.session.user.id
        try {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          if (!allowed) allowed = me?.role === "admin" || me?.role === "member" || perms?.canConfigureBranding === true
        } catch {}
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })
        const limits = getPlanLimits(ws.plan as "free" | "pro" | "enterprise")

        const update: Record<string, unknown> = {}
        if (!limits.allowBranding) {
          if (typeof input.logoUrl !== "undefined" || typeof input.primaryColor !== "undefined" || typeof input.showLogo !== "undefined" || typeof input.showWorkspaceName !== "undefined") throw new HTTPException(403, { message: "Branding not available on current plan" })
        }
        if (typeof input.primaryColor !== "undefined") update.primaryColor = input.primaryColor
        if (typeof input.theme !== "undefined") update.theme = input.theme
        if (typeof input.showLogo !== "undefined") update.showLogo = input.showLogo
        if (typeof input.showWorkspaceName !== "undefined") update.showWorkspaceName = input.showWorkspaceName
        if (typeof input.hidePoweredBy !== "undefined") {
          if (!limits.allowHidePoweredBy) throw new HTTPException(403, { message: "Removing 'Powered by' requires a higher plan" })
          update.hidePoweredBy = input.hidePoweredBy
        }
        if (typeof input.layoutStyle !== "undefined") update.layoutStyle = input.layoutStyle
        if (typeof input.sidebarPosition !== "undefined") update.sidebarPosition = input.sidebarPosition
        update.updatedAt = new Date()

        const [existing] = await ctx.db
          .select({ id: brandingConfig.id })
          .from(brandingConfig)
          .where(eq(brandingConfig.workspaceId, ws.id))
          .limit(1)

        if (existing) {
          await ctx.db
            .update(brandingConfig)
            .set(update)
            .where(eq(brandingConfig.workspaceId, ws.id))
        } else {
          await ctx.db
            .insert(brandingConfig)
            .values({ workspaceId: ws.id, ...update })
        }

        if (typeof input.logoUrl !== "undefined") {
          if (!limits.allowBranding) throw new HTTPException(403, { message: "Logo upload not available on current plan" })
          try {
            await ctx.db.update(workspace).set({ logo: input.logoUrl }).where(eq(workspace.id, ws.id))
          } catch {}
        }

        return c.json({ ok: true })
      }),
  })
}
