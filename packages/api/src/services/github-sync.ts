import { and, asc, desc, eq } from "drizzle-orm"
import {
  activityLog,
  board,
  githubIssueLink,
  post,
  workspace,
  workspaceGithubConnection,
} from "@featul/db"
import { HTTPException } from "hono/http-exception"
import { createHash, randomBytes } from "node:crypto"
import { listRepositoryIssues, type GithubIssue } from "./github-app"
import { suggestRoadmapStatus } from "./github-status-suggest"
import { normalizeStatus } from "../shared/status"

type SyncMode = "backfill" | "incremental"

type SyncResult = {
  counts: {
    created: number
    updated: number
    skipped: number
    suggested: number
    conflicts: number
  }
  nextCursor: string | null
  processed: number
}

type SyncIssueInput = {
  db: any
  workspaceId: string
  boardId: string
  repositoryId: string
  issue: GithubIssue
  labelAllowlist: string[]
  statusLabelMap: Record<string, string>
}

const GITHUB_BOARD_SLUG = "github-issues"
const GITHUB_BOARD_NAME = "GitHub Issues"

function normalizeLabels(labels: string[]): string[] {
  return Array.from(new Set(labels.map((label) => label.trim().toLowerCase()).filter(Boolean)))
}

function hashText(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

function randomSuffix(): string {
  return randomBytes(4).toString("hex")
}

function buildPostSlug(issue: GithubIssue): string {
  const base = `gh-${issue.number}`
  return `${base}-${randomSuffix()}`
}

function shouldSyncIssue(issue: GithubIssue, allowlist: string[]): boolean {
  if (issue.isPullRequest) return false
  if (allowlist.length === 0) return false
  const labels = normalizeLabels(issue.labels)
  return labels.some((label) => allowlist.includes(label))
}

function mergeGithubMetadata(existingMetadata: unknown, issueUrl: string): Record<string, unknown> {
  const current = (existingMetadata && typeof existingMetadata === "object")
    ? (existingMetadata as Record<string, unknown>)
    : {}
  const integrations = (current.integrations && typeof current.integrations === "object")
    ? (current.integrations as Record<string, unknown>)
    : {}

  return {
    ...current,
    integrations: {
      ...integrations,
      github: issueUrl,
    },
  }
}

async function ensureBoardExists(input: { db: any; workspaceId: string; actorUserId?: string | null }): Promise<string> {
  const [existing] = await input.db
    .select({ id: board.id })
    .from(board)
    .where(and(eq(board.workspaceId, input.workspaceId), eq(board.slug, GITHUB_BOARD_SLUG)))
    .limit(1)

  if (existing?.id) return String(existing.id)

  const [workspaceRow] = await input.db
    .select({ ownerId: workspace.ownerId })
    .from(workspace)
    .where(eq(workspace.id, input.workspaceId))
    .limit(1)

  const createdBy = String(input.actorUserId || workspaceRow?.ownerId || "").trim()
  if (!createdBy) {
    throw new HTTPException(500, { message: "Unable to resolve workspace owner for GitHub board creation" })
  }

  const [lastBoard] = await input.db
    .select({ sortOrder: board.sortOrder })
    .from(board)
    .where(eq(board.workspaceId, input.workspaceId))
    .orderBy(desc(board.sortOrder), asc(board.createdAt))
    .limit(1)

  const nextSort = Number(lastBoard?.sortOrder || 0) + 1

  const [created] = await input.db
    .insert(board)
    .values({
      workspaceId: input.workspaceId,
      name: GITHUB_BOARD_NAME,
      slug: GITHUB_BOARD_SLUG,
      isSystem: false,
      isPublic: true,
      isVisible: true,
      allowAnonymous: false,
      allowComments: true,
      sortOrder: Number.isFinite(nextSort) ? nextSort : 0,
      createdBy,
    })
    .returning({ id: board.id })

  if (!created?.id) {
    throw new HTTPException(500, { message: "Failed to create GitHub Issues board" })
  }

  return String(created.id)
}

async function upsertIssueToPost(input: SyncIssueInput): Promise<"created" | "updated" | "skipped" | "conflict"> {
  const labels = normalizeLabels(input.issue.labels)
  if (!shouldSyncIssue(input.issue, input.labelAllowlist)) {
    return "skipped"
  }

  const [existingLink] = await input.db
    .select({
      id: githubIssueLink.id,
      postId: githubIssueLink.postId,
      lastSyncedTitleHash: githubIssueLink.lastSyncedTitleHash,
      lastSyncedBodyHash: githubIssueLink.lastSyncedBodyHash,
    })
    .from(githubIssueLink)
    .where(
      and(
        eq(githubIssueLink.workspaceId, input.workspaceId),
        eq(githubIssueLink.repositoryId, input.repositoryId),
        eq(githubIssueLink.issueId, input.issue.id),
      )
    )
    .limit(1)

  const issueBody = String(input.issue.body || "")
  const nextTitleHash = hashText(input.issue.title)
  const nextBodyHash = hashText(issueBody)

  const suggestion = await suggestRoadmapStatus({
    title: input.issue.title,
    body: issueBody,
    labels,
    issueState: input.issue.state,
    issueStateReason: input.issue.stateReason,
    statusLabelMap: input.statusLabelMap,
  })

  if (!existingLink?.id) {
    const [newPost] = await input.db
      .insert(post)
      .values({
        boardId: input.boardId,
        title: input.issue.title || `GitHub Issue #${input.issue.number}`,
        content: issueBody,
        slug: buildPostSlug(input.issue),
        roadmapStatus: "pending",
        status: "published",
        metadata: mergeGithubMetadata(undefined, input.issue.htmlUrl),
      })
      .returning({ id: post.id })

    if (!newPost?.id) {
      throw new HTTPException(500, { message: "Failed to create synced post" })
    }

    await input.db.insert(githubIssueLink).values({
      workspaceId: input.workspaceId,
      postId: newPost.id,
      repositoryId: input.repositoryId,
      issueId: input.issue.id,
      issueNumber: input.issue.number,
      issueUrl: input.issue.htmlUrl,
      issueState: input.issue.state,
      issueStateReason: input.issue.stateReason,
      issueLabels: labels,
      lastIssueUpdatedAt: input.issue.updatedAt ? new Date(input.issue.updatedAt) : null,
      lastSyncedAt: new Date(),
      suggestedRoadmapStatus: suggestion.suggestedStatus,
      suggestionConfidence: suggestion.confidence,
      suggestionReason: suggestion.reason,
      suggestionState: "pending",
      suggestedAt: new Date(),
      lastSyncedTitleHash: nextTitleHash,
      lastSyncedBodyHash: nextBodyHash,
      hasContentConflict: false,
    })

    return "created"
  }

  const [targetPost] = await input.db
    .select({
      id: post.id,
      title: post.title,
      content: post.content,
      metadata: post.metadata,
    })
    .from(post)
    .where(eq(post.id, existingLink.postId))
    .limit(1)

  if (!targetPost?.id) {
    return "skipped"
  }

  const currentTitleHash = hashText(String(targetPost.title || ""))
  const currentBodyHash = hashText(String(targetPost.content || ""))
  const hasManualEdits = Boolean(
    existingLink.lastSyncedTitleHash
    && existingLink.lastSyncedBodyHash
    && (
      existingLink.lastSyncedTitleHash !== currentTitleHash
      || existingLink.lastSyncedBodyHash !== currentBodyHash
    )
  )

  if (!hasManualEdits) {
    await input.db
      .update(post)
      .set({
        title: input.issue.title || String(targetPost.title || ""),
        content: issueBody,
        metadata: mergeGithubMetadata(targetPost.metadata, input.issue.htmlUrl),
        updatedAt: new Date(),
      })
      .where(eq(post.id, targetPost.id))
  }

  await input.db
    .update(githubIssueLink)
    .set({
      issueNumber: input.issue.number,
      issueUrl: input.issue.htmlUrl,
      issueState: input.issue.state,
      issueStateReason: input.issue.stateReason,
      issueLabels: labels,
      lastIssueUpdatedAt: input.issue.updatedAt ? new Date(input.issue.updatedAt) : null,
      lastSyncedAt: new Date(),
      suggestedRoadmapStatus: suggestion.suggestedStatus,
      suggestionConfidence: suggestion.confidence,
      suggestionReason: suggestion.reason,
      suggestionState: "pending",
      suggestedAt: new Date(),
      lastSyncedTitleHash: hasManualEdits ? existingLink.lastSyncedTitleHash : nextTitleHash,
      lastSyncedBodyHash: hasManualEdits ? existingLink.lastSyncedBodyHash : nextBodyHash,
      hasContentConflict: hasManualEdits,
      updatedAt: new Date(),
    })
    .where(eq(githubIssueLink.id, existingLink.id))

  return hasManualEdits ? "conflict" : "updated"
}

export async function runGithubSync(input: {
  db: any
  workspaceId: string
  mode: SyncMode
  cursor?: string
  limit?: number
  actorUserId?: string | null
}): Promise<SyncResult> {
  const [connection] = await input.db
    .select({
      id: workspaceGithubConnection.id,
      workspaceId: workspaceGithubConnection.workspaceId,
      installationId: workspaceGithubConnection.installationId,
      repositoryId: workspaceGithubConnection.repositoryId,
      repositoryName: workspaceGithubConnection.repositoryName,
      repositoryOwner: workspaceGithubConnection.repositoryOwner,
      targetBoardId: workspaceGithubConnection.targetBoardId,
      labelAllowlist: workspaceGithubConnection.labelAllowlist,
      statusLabelMap: workspaceGithubConnection.statusLabelMap,
      lastSyncAt: workspaceGithubConnection.lastSyncAt,
      isActive: workspaceGithubConnection.isActive,
    })
    .from(workspaceGithubConnection)
    .where(eq(workspaceGithubConnection.workspaceId, input.workspaceId))
    .limit(1)

  if (!connection?.id || !connection.isActive) {
    throw new HTTPException(404, { message: "GitHub connection is not configured for this workspace" })
  }

  const labelAllowlist = normalizeLabels(Array.isArray(connection.labelAllowlist) ? connection.labelAllowlist : [])
  if (labelAllowlist.length === 0) {
    throw new HTTPException(400, { message: "GitHub sync requires at least one label in allowlist" })
  }

  let boardId = String(connection.targetBoardId || "").trim()
  if (!boardId) {
    boardId = await ensureBoardExists({
      db: input.db,
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
    })

    await input.db
      .update(workspaceGithubConnection)
      .set({ targetBoardId: boardId, updatedAt: new Date() })
      .where(eq(workspaceGithubConnection.id, connection.id))
  }

  const page = Math.max(1, Number(input.cursor || 1))
  const perPage = Math.max(1, Math.min(100, Number(input.limit || 30)))

  const sinceDate = (() => {
    if (input.mode === "incremental" && connection.lastSyncAt) {
      return connection.lastSyncAt.toISOString()
    }
    const backfillStart = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    return backfillStart.toISOString()
  })()

  const { issues, hasMore } = await listRepositoryIssues({
    installationId: String(connection.installationId),
    owner: String(connection.repositoryOwner),
    repo: String(connection.repositoryName),
    since: sinceDate,
    state: "all",
    page,
    perPage,
  })

  const counts = {
    created: 0,
    updated: 0,
    skipped: 0,
    suggested: 0,
    conflicts: 0,
  }

  const statusLabelMap = (connection.statusLabelMap && typeof connection.statusLabelMap === "object")
    ? (connection.statusLabelMap as Record<string, string>)
    : {}

  for (const issue of issues) {
    const result = await upsertIssueToPost({
      db: input.db,
      workspaceId: String(connection.workspaceId),
      boardId,
      repositoryId: String(connection.repositoryId),
      issue,
      labelAllowlist,
      statusLabelMap,
    })

    if (result === "created") {
      counts.created += 1
      counts.suggested += 1
    } else if (result === "updated") {
      counts.updated += 1
      counts.suggested += 1
    } else if (result === "conflict") {
      counts.conflicts += 1
      counts.suggested += 1
    } else {
      counts.skipped += 1
    }
  }

  await input.db
    .update(workspaceGithubConnection)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(eq(workspaceGithubConnection.id, connection.id))

  return {
    counts,
    nextCursor: hasMore ? String(page + 1) : null,
    processed: issues.length,
  }
}

export async function syncWebhookIssue(input: {
  db: any
  installationId: string
  repositoryId: string
  issue: GithubIssue
}): Promise<{ status: "processed" | "ignored" | "not_connected"; result?: string }> {
  const [connection] = await input.db
    .select({
      workspaceId: workspaceGithubConnection.workspaceId,
      targetBoardId: workspaceGithubConnection.targetBoardId,
      labelAllowlist: workspaceGithubConnection.labelAllowlist,
      statusLabelMap: workspaceGithubConnection.statusLabelMap,
      isActive: workspaceGithubConnection.isActive,
      repositoryId: workspaceGithubConnection.repositoryId,
      id: workspaceGithubConnection.id,
    })
    .from(workspaceGithubConnection)
    .where(
      and(
        eq(workspaceGithubConnection.installationId, input.installationId),
        eq(workspaceGithubConnection.repositoryId, input.repositoryId),
      )
    )
    .limit(1)

  if (!connection?.id || !connection.isActive) {
    return { status: "not_connected" }
  }

  if (input.issue.isPullRequest) {
    return { status: "ignored", result: "pull_request" }
  }

  const boardId = String(connection.targetBoardId || "").trim()
  if (!boardId) {
    return { status: "ignored", result: "missing_board" }
  }

  const result = await upsertIssueToPost({
    db: input.db,
    workspaceId: String(connection.workspaceId),
    boardId,
    repositoryId: String(connection.repositoryId),
    issue: input.issue,
    labelAllowlist: normalizeLabels(Array.isArray(connection.labelAllowlist) ? connection.labelAllowlist : []),
    statusLabelMap: (connection.statusLabelMap && typeof connection.statusLabelMap === "object")
      ? (connection.statusLabelMap as Record<string, string>)
      : {},
  })

  await input.db
    .update(workspaceGithubConnection)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(eq(workspaceGithubConnection.id, connection.id))

  return {
    status: "processed",
    result,
  }
}

export async function handleGithubIssueDeleted(input: {
  db: any
  installationId: string
  repositoryId: string
  issueId: string
}): Promise<void> {
  const [connection] = await input.db
    .select({
      workspaceId: workspaceGithubConnection.workspaceId,
      repositoryId: workspaceGithubConnection.repositoryId,
    })
    .from(workspaceGithubConnection)
    .where(
      and(
        eq(workspaceGithubConnection.installationId, input.installationId),
        eq(workspaceGithubConnection.repositoryId, input.repositoryId),
      )
    )
    .limit(1)

  if (!connection?.workspaceId) return

  const [link] = await input.db
    .select({ id: githubIssueLink.id, postId: githubIssueLink.postId })
    .from(githubIssueLink)
    .where(
      and(
        eq(githubIssueLink.workspaceId, connection.workspaceId),
        eq(githubIssueLink.repositoryId, connection.repositoryId),
        eq(githubIssueLink.issueId, input.issueId),
      )
    )
    .limit(1)

  if (!link?.id) return

  await input.db
    .update(githubIssueLink)
    .set({
      issueState: "deleted",
      issueStateReason: null,
      suggestedRoadmapStatus: normalizeStatus("closed"),
      suggestionConfidence: 0.9,
      suggestionReason: "GitHub issue was deleted",
      suggestionState: "pending",
      suggestedAt: new Date(),
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(githubIssueLink.id, link.id))
}

export async function ensureGithubBoardForWorkspace(input: {
  db: any
  workspaceId: string
  actorUserId?: string | null
}): Promise<{ boardId: string; boardSlug: string; boardName: string }> {
  const boardId = await ensureBoardExists(input)
  return { boardId, boardSlug: GITHUB_BOARD_SLUG, boardName: GITHUB_BOARD_NAME }
}

export async function recordGithubActivity(input: {
  db: any
  workspaceId: string
  userId: string
  action: string
  actionType: "create" | "update" | "delete"
  entity: string
  entityId: string
  title?: string | null
  metadata?: Record<string, unknown>
}): Promise<void> {
  await input.db.insert(activityLog).values({
    workspaceId: input.workspaceId,
    userId: input.userId,
    action: input.action,
    actionType: input.actionType,
    entity: input.entity,
    entityId: input.entityId,
    title: input.title || null,
    metadata: input.metadata || {},
  })
}

export type { SyncMode, SyncResult }
