import { eq, and } from "drizzle-orm"
import { j, privateProcedure } from "../jstack"
import { workspace, workspaceIntegration, workspaceMember } from "@featul/db"
import {
  connectWebhookSchema,
  disconnectWebhookSchema,
  testWebhookSchema,
  listIntegrationsSchema,
} from "../validators/integration"
import { sendTestNotification } from "../services/webhook"
import { isIntegrationsAllowed } from "../shared/plan"
import { HTTPException } from "hono/http-exception"
import type { IntegrationType } from "../validators/integration"

/**
 * Helper to check if user has permission to manage integrations
 */
async function checkIntegrationPermission(
  db: any,
  workspaceId: string,
  userId: string
): Promise<boolean> {
  // Check if owner
  const [ws] = await db
    .select({ ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1)

  if (ws?.ownerId === userId) return true

  // Check if admin member
  const [member] = await db
    .select({ role: workspaceMember.role })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId)
      )
    )
    .limit(1)

  return member?.role === "admin"
}

/**
 * Integration router for webhook management
 */
export function createIntegrationRouter() {
  return j.router({
    /**
     * List all integrations for a workspace
     */
    list: privateProcedure
      .input(listIntegrationsSchema)
      .get(async ({ ctx, input, c }) => {
        const { workspaceSlug } = input
        const userId = ctx.session.user.id

        // Resolve workspace
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        // Check permission
        const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
        if (!hasPermission) {
          throw new HTTPException(403, { message: "You don't have permission to view integrations" })
        }

        // Get all integrations
        const integrations = await ctx.db
          .select({
            id: workspaceIntegration.id,
            type: workspaceIntegration.type,
            isActive: workspaceIntegration.isActive,
            lastTriggeredAt: workspaceIntegration.lastTriggeredAt,
            createdAt: workspaceIntegration.createdAt,
          })
          .from(workspaceIntegration)
          .where(eq(workspaceIntegration.workspaceId, ws.id))

        return c.superjson({ integrations })
      }),

    /**
     * Connect a webhook integration
     */
    connect: privateProcedure
      .input(connectWebhookSchema)
      .post(async ({ ctx, input, c }) => {
        const { workspaceSlug, type, webhookUrl } = input
        const userId = ctx.session.user.id

        // Resolve workspace
        const [ws] = await ctx.db
          .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        // Check permission
        const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
        if (!hasPermission) {
          throw new HTTPException(403, { message: "You don't have permission to manage integrations" })
        }

        const plan = ws.plan ?? "free"
        if (!isIntegrationsAllowed(plan)) {
          throw new HTTPException(403, { message: "Integrations are available on Starter or Professional plans" })
        }

        // Check if integration already exists
        const [existing] = await ctx.db
          .select({ id: workspaceIntegration.id })
          .from(workspaceIntegration)
          .where(
            and(
              eq(workspaceIntegration.workspaceId, ws.id),
              eq(workspaceIntegration.type, type)
            )
          )
          .limit(1)

        if (existing) {
          // Update existing integration
          await ctx.db
            .update(workspaceIntegration)
            .set({ webhookUrl, isActive: true, updatedAt: new Date() })
            .where(eq(workspaceIntegration.id, existing.id))

          return c.superjson({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} integration updated`,
          })
        }

        // Create new integration
        await ctx.db.insert(workspaceIntegration).values({
          workspaceId: ws.id,
          type,
          webhookUrl,
          isActive: true,
        })

        return c.superjson({
          success: true,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} integration connected`,
        })
      }),

    /**
     * Disconnect a webhook integration
     */
    disconnect: privateProcedure
      .input(disconnectWebhookSchema)
      .post(async ({ ctx, input, c }) => {
        const { workspaceSlug, type } = input
        const userId = ctx.session.user.id

        // Resolve workspace
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        // Check permission
        const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
        if (!hasPermission) {
          throw new HTTPException(403, { message: "You don't have permission to manage integrations" })
        }

        // Delete integration
        const deleted = await ctx.db
          .delete(workspaceIntegration)
          .where(
            and(
              eq(workspaceIntegration.workspaceId, ws.id),
              eq(workspaceIntegration.type, type)
            )
          )
          .returning({ id: workspaceIntegration.id })

        if (deleted.length === 0) {
          throw new HTTPException(404, { message: "Integration not found" })
        }

        return c.superjson({
          success: true,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} integration disconnected`,
        })
      }),

    /**
     * Test a webhook integration
     */
    test: privateProcedure
      .input(testWebhookSchema)
      .post(async ({ ctx, input, c }) => {
        const { workspaceSlug, type } = input
        const userId = ctx.session.user.id

        // Resolve workspace
        const [ws] = await ctx.db
          .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        // Check permission
        const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
        if (!hasPermission) {
          throw new HTTPException(403, { message: "You don't have permission to test integrations" })
        }

        const plan = ws.plan ?? "free"
        if (!isIntegrationsAllowed(plan)) {
          throw new HTTPException(403, { message: "Integrations are available on Starter or Professional plans" })
        }

        // Get integration
        const [integration] = await ctx.db
          .select({ webhookUrl: workspaceIntegration.webhookUrl })
          .from(workspaceIntegration)
          .where(
            and(
              eq(workspaceIntegration.workspaceId, ws.id),
              eq(workspaceIntegration.type, type)
            )
          )
          .limit(1)

        if (!integration) {
          throw new HTTPException(404, { message: "Integration not found" })
        }

        // Send test notification
        const result = await sendTestNotification(
          type as IntegrationType,
          integration.webhookUrl,
          ws.name
        )

        if (!result.success) {
          throw new HTTPException(500, { message: result.error || "Failed to send test notification" })
        }

        return c.superjson({
          success: true,
          message: "Test notification sent successfully",
        })
      }),
  })
}
