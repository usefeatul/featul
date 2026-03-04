import { eq, and, desc } from "drizzle-orm"
import { j, privateProcedure } from "../jstack"
import {
  workspace,
  workspaceIntegration,
  workspaceMember,
  workspaceGithubConnection,
  githubIssueLink,
  post,
} from "@featul/db"
import {
  connectWebhookSchema,
  disconnectWebhookSchema,
  testWebhookSchema,
  listIntegrationsSchema,
  githubConnectionGetSchema,
  githubConnectStartSchema,
  githubConnectionCompleteSchema,
  githubSelectRepoSchema,
  githubSyncNowSchema,
  githubSuggestionsListSchema,
  githubSuggestionApplySchema,
  githubDisconnectSchema,
} from "../validators/integration"
import { sendTestNotification } from "../services/webhook"
import { isIntegrationsAllowed } from "../shared/plan"
import { HTTPException } from "hono/http-exception"
import type { IntegrationType } from "../validators/integration"
import {
  assertInstallationHasRepository,
  getGithubAppInstallUrl,
  isGithubAppConfigured,
  listInstallationRepositories,
} from "../services/github-app"
import {
  ensureGithubBoardForWorkspace,
  recordGithubActivity,
  runGithubSync,
} from "../services/github-sync"
import { createSetupState, verifySetupState } from "../services/github-setup-state"
import { normalizeStatus } from "../shared/status"

/**
 * Helper to check if user has permission to manage integrations
 */
async function checkIntegrationPermission(
  db: any,
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const [ws] = await db
    .select({ ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.id, workspaceId))
    .limit(1)

  if (ws?.ownerId === userId) return true

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

async function requireWorkspaceForIntegration(ctx: any, workspaceSlug: string, userId: string) {
  const [ws] = await ctx.db
    .select({ id: workspace.id, ownerId: workspace.ownerId, plan: workspace.plan, slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.slug, workspaceSlug))
    .limit(1)

  if (!ws) {
    throw new HTTPException(404, { message: "Workspace not found" })
  }

  const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
  if (!hasPermission) {
    throw new HTTPException(403, { message: "You don't have permission to manage integrations" })
  }

  return ws
}

/**
 * Integration router for webhook management
 */
export function createIntegrationRouter() {
  return j.router({
    list: privateProcedure
      .input(listIntegrationsSchema)
      .get(async ({ ctx, input, c }) => {
        const { workspaceSlug } = input
        const userId = ctx.session.user.id

        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
        if (!hasPermission) {
          throw new HTTPException(403, { message: "You don't have permission to view integrations" })
        }

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

    connect: privateProcedure
      .input(connectWebhookSchema)
      .post(async ({ ctx, input, c }) => {
        const { workspaceSlug, type, webhookUrl } = input
        const userId = ctx.session.user.id

        const [ws] = await ctx.db
          .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
        if (!hasPermission) {
          throw new HTTPException(403, { message: "You don't have permission to manage integrations" })
        }

        const plan = ws.plan ?? "free"
        if (!isIntegrationsAllowed(plan)) {
          throw new HTTPException(403, { message: "Integrations are available on Starter or Professional plans" })
        }

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
          await ctx.db
            .update(workspaceIntegration)
            .set({ webhookUrl, isActive: true, updatedAt: new Date() })
            .where(eq(workspaceIntegration.id, existing.id))

          return c.superjson({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} integration updated`,
          })
        }

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

    disconnect: privateProcedure
      .input(disconnectWebhookSchema)
      .post(async ({ ctx, input, c }) => {
        const { workspaceSlug, type } = input
        const userId = ctx.session.user.id

        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
        if (!hasPermission) {
          throw new HTTPException(403, { message: "You don't have permission to manage integrations" })
        }

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

    test: privateProcedure
      .input(testWebhookSchema)
      .post(async ({ ctx, input, c }) => {
        const { workspaceSlug, type } = input
        const userId = ctx.session.user.id

        const [ws] = await ctx.db
          .select({ id: workspace.id, name: workspace.name, ownerId: workspace.ownerId, plan: workspace.plan })
          .from(workspace)
          .where(eq(workspace.slug, workspaceSlug))
          .limit(1)

        if (!ws) {
          throw new HTTPException(404, { message: "Workspace not found" })
        }

        const hasPermission = await checkIntegrationPermission(ctx.db, ws.id, userId)
        if (!hasPermission) {
          throw new HTTPException(403, { message: "You don't have permission to test integrations" })
        }

        const plan = ws.plan ?? "free"
        if (!isIntegrationsAllowed(plan)) {
          throw new HTTPException(403, { message: "Integrations are available on Starter or Professional plans" })
        }

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

    githubConnectionGet: privateProcedure
      .input(githubConnectionGetSchema)
      .get(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id
        const ws = await requireWorkspaceForIntegration(ctx, input.workspaceSlug, userId)

        const [connection] = await ctx.db
          .select({
            id: workspaceGithubConnection.id,
            installationId: workspaceGithubConnection.installationId,
            repositoryId: workspaceGithubConnection.repositoryId,
            repositoryName: workspaceGithubConnection.repositoryName,
            repositoryOwner: workspaceGithubConnection.repositoryOwner,
            repositoryFullName: workspaceGithubConnection.repositoryFullName,
            targetBoardId: workspaceGithubConnection.targetBoardId,
            labelAllowlist: workspaceGithubConnection.labelAllowlist,
            statusLabelMap: workspaceGithubConnection.statusLabelMap,
            isActive: workspaceGithubConnection.isActive,
            lastSyncAt: workspaceGithubConnection.lastSyncAt,
            createdAt: workspaceGithubConnection.createdAt,
          })
          .from(workspaceGithubConnection)
          .where(eq(workspaceGithubConnection.workspaceId, ws.id))
          .limit(1)

        let pendingSuggestions = 0
        if (connection?.id) {
          const rows = await ctx.db
            .select({ id: githubIssueLink.id })
            .from(githubIssueLink)
            .where(
              and(
                eq(githubIssueLink.workspaceId, ws.id),
                eq(githubIssueLink.suggestionState, "pending"),
              )
            )
          pendingSuggestions = rows.length
        }

        return c.superjson({
          configured: isGithubAppConfigured(),
          connection: connection || null,
          pendingSuggestions,
          statuses: ["pending", "review", "planned", "progress", "completed", "closed"],
        })
      }),

    githubConnectStart: privateProcedure
      .input(githubConnectStartSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id
        const ws = await requireWorkspaceForIntegration(ctx, input.workspaceSlug, userId)

        const plan = ws.plan ?? "free"
        if (!isIntegrationsAllowed(plan)) {
          throw new HTTPException(403, { message: "Integrations are available on Starter or Professional plans" })
        }

        if (!isGithubAppConfigured()) {
          throw new HTTPException(503, {
            message: "GitHub integration is not configured on this environment",
          })
        }

        const state = createSetupState({
          workspaceSlug: ws.slug,
          userId,
          issuedAt: Date.now(),
        })
        const installUrl = getGithubAppInstallUrl(state)

        return c.superjson({
          url: installUrl,
          state,
        })
      }),

    githubConnectionComplete: privateProcedure
      .input(githubConnectionCompleteSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id
        const ws = await requireWorkspaceForIntegration(ctx, input.workspaceSlug, userId)
        if (input.state) {
          const setupState = verifySetupState(input.state)
          if (setupState.workspaceSlug !== ws.slug) {
            throw new HTTPException(400, { message: "GitHub setup state workspace mismatch" })
          }
          if (setupState.userId !== userId) {
            throw new HTTPException(403, { message: "GitHub setup state user mismatch" })
          }
        }

        const plan = ws.plan ?? "free"
        if (!isIntegrationsAllowed(plan)) {
          throw new HTTPException(403, { message: "Integrations are available on Starter or Professional plans" })
        }

        if (!isGithubAppConfigured()) {
          throw new HTTPException(503, {
            message: "GitHub integration is not configured on this environment",
          })
        }

        const repositories = await listInstallationRepositories(input.installationId)

        if (input.state) {
          await recordGithubActivity({
            db: ctx.db,
            workspaceId: ws.id,
            userId,
            action: "github_connected",
            actionType: "create",
            entity: "workspace_github_connection",
            entityId: ws.id,
            title: null,
            metadata: {
              installationId: input.installationId,
              repositoriesCount: repositories.length,
            },
          })
        }

        return c.superjson({
          installationId: input.installationId,
          repositories,
        })
      }),

    githubSelectRepo: privateProcedure
      .input(githubSelectRepoSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id
        const ws = await requireWorkspaceForIntegration(ctx, input.workspaceSlug, userId)

        const plan = ws.plan ?? "free"
        if (!isIntegrationsAllowed(plan)) {
          throw new HTTPException(403, { message: "Integrations are available on Starter or Professional plans" })
        }

        if (!isGithubAppConfigured()) {
          throw new HTTPException(503, {
            message: "GitHub integration is not configured on this environment",
          })
        }

        const repo = await assertInstallationHasRepository({
          installationId: input.installationId,
          repositoryId: input.repositoryId,
        })

        const boardInfo = await ensureGithubBoardForWorkspace({
          db: ctx.db,
          workspaceId: ws.id,
          actorUserId: userId,
        })

        const payload = {
          installationId: input.installationId,
          repositoryId: repo.id,
          repositoryName: repo.name,
          repositoryOwner: repo.owner,
          repositoryFullName: repo.fullName,
          targetBoardId: boardInfo.boardId,
          labelAllowlist: input.labelAllowlist,
          statusLabelMap: input.statusLabelMap || {},
          isActive: true,
          updatedAt: new Date(),
        }

        const [existing] = await ctx.db
          .select({ id: workspaceGithubConnection.id })
          .from(workspaceGithubConnection)
          .where(eq(workspaceGithubConnection.workspaceId, ws.id))
          .limit(1)

        let connectionId = ""
        if (existing?.id) {
          await ctx.db
            .update(workspaceGithubConnection)
            .set(payload)
            .where(eq(workspaceGithubConnection.id, existing.id))
          connectionId = String(existing.id)
        } else {
          const [created] = await ctx.db
            .insert(workspaceGithubConnection)
            .values({
              workspaceId: ws.id,
              ...payload,
              createdBy: userId,
            })
            .returning({ id: workspaceGithubConnection.id })
          connectionId = String(created?.id || "")
        }

        await recordGithubActivity({
          db: ctx.db,
          workspaceId: ws.id,
          userId,
          action: "github_repo_selected",
          actionType: existing?.id ? "update" : "create",
          entity: "workspace_github_connection",
          entityId: connectionId || ws.id,
          title: input.repositoryFullName,
          metadata: {
            installationId: input.installationId,
            repositoryId: repo.id,
            repositoryFullName: repo.fullName,
            labelAllowlist: input.labelAllowlist,
          },
        })

        return c.superjson({
          ok: true,
          connection: {
            id: connectionId,
            installationId: input.installationId,
            repositoryId: repo.id,
            repositoryName: repo.name,
            repositoryOwner: repo.owner,
            repositoryFullName: repo.fullName,
            targetBoardId: boardInfo.boardId,
            targetBoardSlug: boardInfo.boardSlug,
            targetBoardName: boardInfo.boardName,
            labelAllowlist: input.labelAllowlist,
            statusLabelMap: input.statusLabelMap || {},
            isActive: true,
          },
        })
      }),

    githubSyncNow: privateProcedure
      .input(githubSyncNowSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id
        const ws = await requireWorkspaceForIntegration(ctx, input.workspaceSlug, userId)

        const plan = ws.plan ?? "free"
        if (!isIntegrationsAllowed(plan)) {
          throw new HTTPException(403, { message: "Integrations are available on Starter or Professional plans" })
        }

        await recordGithubActivity({
          db: ctx.db,
          workspaceId: ws.id,
          userId,
          action: "github_sync_started",
          actionType: "update",
          entity: "workspace_github_connection",
          entityId: ws.id,
          title: null,
          metadata: {
            mode: input.mode,
            cursor: input.cursor || null,
            limit: input.limit,
          },
        })

        try {
          const sync = await runGithubSync({
            db: ctx.db,
            workspaceId: ws.id,
            mode: input.mode,
            cursor: input.cursor,
            limit: input.limit,
            actorUserId: userId,
          })

          await recordGithubActivity({
            db: ctx.db,
            workspaceId: ws.id,
            userId,
            action: "github_sync_completed",
            actionType: "update",
            entity: "workspace_github_connection",
            entityId: ws.id,
            title: null,
            metadata: {
              mode: input.mode,
              cursor: input.cursor || null,
              nextCursor: sync.nextCursor,
              processed: sync.processed,
              ...sync.counts,
            },
          })

          return c.superjson({
            ok: true,
            mode: input.mode,
            nextCursor: sync.nextCursor,
            processed: sync.processed,
            ...sync.counts,
          })
        } catch (error) {
          await recordGithubActivity({
            db: ctx.db,
            workspaceId: ws.id,
            userId,
            action: "github_sync_failed",
            actionType: "update",
            entity: "workspace_github_connection",
            entityId: ws.id,
            title: null,
            metadata: {
              mode: input.mode,
              cursor: input.cursor || null,
              message: error instanceof Error ? error.message : "Sync failed",
            },
          })
          throw error
        }
      }),

    githubSuggestionsList: privateProcedure
      .input(githubSuggestionsListSchema)
      .get(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id
        const ws = await requireWorkspaceForIntegration(ctx, input.workspaceSlug, userId)

        const rows = await ctx.db
          .select({
            id: githubIssueLink.id,
            postId: githubIssueLink.postId,
            issueId: githubIssueLink.issueId,
            issueNumber: githubIssueLink.issueNumber,
            issueUrl: githubIssueLink.issueUrl,
            issueState: githubIssueLink.issueState,
            issueLabels: githubIssueLink.issueLabels,
            suggestedRoadmapStatus: githubIssueLink.suggestedRoadmapStatus,
            suggestionConfidence: githubIssueLink.suggestionConfidence,
            suggestionReason: githubIssueLink.suggestionReason,
            suggestionState: githubIssueLink.suggestionState,
            suggestedAt: githubIssueLink.suggestedAt,
            hasContentConflict: githubIssueLink.hasContentConflict,
            postTitle: post.title,
            postRoadmapStatus: post.roadmapStatus,
            postSlug: post.slug,
          })
          .from(githubIssueLink)
          .innerJoin(post, eq(post.id, githubIssueLink.postId))
          .where(
            and(
              eq(githubIssueLink.workspaceId, ws.id),
              eq(githubIssueLink.suggestionState, input.state),
            )
          )
          .orderBy(desc(githubIssueLink.suggestedAt), desc(githubIssueLink.updatedAt))
          .limit(input.limit)

        return c.superjson({
          suggestions: rows,
        })
      }),

    githubSuggestionApply: privateProcedure
      .input(githubSuggestionApplySchema)
      .post(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id
        const ws = await requireWorkspaceForIntegration(ctx, input.workspaceSlug, userId)

        const [item] = await ctx.db
          .select({
            id: githubIssueLink.id,
            postId: githubIssueLink.postId,
            suggestedRoadmapStatus: githubIssueLink.suggestedRoadmapStatus,
            issueUrl: githubIssueLink.issueUrl,
          })
          .from(githubIssueLink)
          .where(
            and(
              eq(githubIssueLink.workspaceId, ws.id),
              eq(githubIssueLink.id, input.issueLinkId),
            )
          )
          .limit(1)

        if (!item?.id) {
          throw new HTTPException(404, { message: "Suggestion not found" })
        }

        if (input.action === "accept") {
          const rawStatus = String(item.suggestedRoadmapStatus || "").trim().toLowerCase()
          if (!rawStatus) {
            throw new HTTPException(400, { message: "Suggestion does not include a roadmap status" })
          }
          const status = normalizeStatus(rawStatus)

          await ctx.db
            .update(post)
            .set({ roadmapStatus: status, updatedAt: new Date() })
            .where(eq(post.id, item.postId))

          await ctx.db
            .update(githubIssueLink)
            .set({ suggestionState: "accepted", updatedAt: new Date() })
            .where(eq(githubIssueLink.id, item.id))

          await recordGithubActivity({
            db: ctx.db,
            workspaceId: ws.id,
            userId,
            action: "github_suggestion_accepted",
            actionType: "update",
            entity: "github_issue_link",
            entityId: item.id,
            title: null,
            metadata: {
              postId: item.postId,
              issueUrl: item.issueUrl,
              roadmapStatus: status,
            },
          })
        } else {
          await ctx.db
            .update(githubIssueLink)
            .set({ suggestionState: "rejected", updatedAt: new Date() })
            .where(eq(githubIssueLink.id, item.id))

          await recordGithubActivity({
            db: ctx.db,
            workspaceId: ws.id,
            userId,
            action: "github_suggestion_rejected",
            actionType: "update",
            entity: "github_issue_link",
            entityId: item.id,
            title: null,
            metadata: {
              postId: item.postId,
              issueUrl: item.issueUrl,
            },
          })
        }

        return c.superjson({ ok: true })
      }),

    githubDisconnect: privateProcedure
      .input(githubDisconnectSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = ctx.session.user.id
        const ws = await requireWorkspaceForIntegration(ctx, input.workspaceSlug, userId)

        const [existing] = await ctx.db
          .select({ id: workspaceGithubConnection.id })
          .from(workspaceGithubConnection)
          .where(eq(workspaceGithubConnection.workspaceId, ws.id))
          .limit(1)

        if (!existing?.id) {
          throw new HTTPException(404, { message: "GitHub integration is not connected" })
        }

        await ctx.db
          .delete(workspaceGithubConnection)
          .where(eq(workspaceGithubConnection.id, existing.id))

        await recordGithubActivity({
          db: ctx.db,
          workspaceId: ws.id,
          userId,
          action: "github_disconnected",
          actionType: "delete",
          entity: "workspace_github_connection",
          entityId: existing.id,
          title: null,
          metadata: {},
        })

        return c.superjson({ ok: true })
      }),
  })
}
