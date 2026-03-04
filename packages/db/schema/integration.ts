import { pgTable, text, timestamp, boolean, uniqueIndex, index, json, doublePrecision } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { workspace } from './workspace'
import { board } from './feedback'
import { post } from './post'
import { user } from './auth'

/**
 * Workspace Integration table for storing webhook configurations
 * Supports Discord and Slack webhook integrations
 */
export const workspaceIntegration = pgTable(
  'workspace_integration',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['discord', 'slack'] }).notNull(),
    webhookUrl: text('webhook_url').notNull(),
    isActive: boolean('is_active').default(true),
    lastTriggeredAt: timestamp('last_triggered_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    // Only one integration of each type per workspace
    workspaceIntegrationTypeUnique: uniqueIndex('workspace_integration_type_unique').on(
      table.workspaceId,
      table.type
    ),
    workspaceIntegrationWorkspaceIdx: index('workspace_integration_workspace_idx').on(table.workspaceId),
  } as const)
)

export type WorkspaceIntegration = typeof workspaceIntegration.$inferSelect
export type NewWorkspaceIntegration = typeof workspaceIntegration.$inferInsert

export const workspaceGithubConnection = pgTable(
  'workspace_github_connection',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    installationId: text('installation_id').notNull(),
    repositoryId: text('repository_id').notNull(),
    repositoryName: text('repository_name').notNull(),
    repositoryOwner: text('repository_owner').notNull(),
    repositoryFullName: text('repository_full_name').notNull(),
    targetBoardId: text('target_board_id')
      .references(() => board.id, { onDelete: 'set null' }),
    labelAllowlist: json('label_allowlist').$type<string[]>().notNull().default([]),
    statusLabelMap: json('status_label_map').$type<Record<string, string>>().notNull().default({}),
    isActive: boolean('is_active').notNull().default(true),
    lastSyncAt: timestamp('last_sync_at'),
    createdBy: text('created_by')
      .references(() => user.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    workspaceGithubConnectionWorkspaceUnique: uniqueIndex('workspace_github_connection_workspace_unique').on(table.workspaceId),
    workspaceGithubConnectionWorkspaceIdx: index('workspace_github_connection_workspace_idx').on(table.workspaceId),
    workspaceGithubConnectionInstallationIdx: index('workspace_github_connection_installation_idx').on(table.installationId),
    workspaceGithubConnectionRepositoryIdx: index('workspace_github_connection_repository_idx').on(table.repositoryId),
  } as const)
)

export const githubIssueLink = pgTable(
  'github_issue_link',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    postId: text('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    repositoryId: text('repository_id').notNull(),
    issueId: text('issue_id').notNull(),
    issueNumber: text('issue_number').notNull(),
    issueUrl: text('issue_url').notNull(),
    issueState: text('issue_state').notNull(),
    issueStateReason: text('issue_state_reason'),
    issueLabels: json('issue_labels').$type<string[]>().notNull().default([]),
    lastIssueUpdatedAt: timestamp('last_issue_updated_at'),
    lastSyncedAt: timestamp('last_synced_at').notNull().defaultNow(),
    suggestedRoadmapStatus: text('suggested_roadmap_status'),
    suggestionConfidence: doublePrecision('suggestion_confidence'),
    suggestionReason: text('suggestion_reason'),
    suggestionState: text('suggestion_state', { enum: ['pending', 'accepted', 'rejected'] }).notNull().default('pending'),
    suggestedAt: timestamp('suggested_at'),
    lastSyncedTitleHash: text('last_synced_title_hash'),
    lastSyncedBodyHash: text('last_synced_body_hash'),
    hasContentConflict: boolean('has_content_conflict').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    githubIssueLinkWorkspaceRepoIssueUnique: uniqueIndex('github_issue_link_workspace_repo_issue_unique').on(table.workspaceId, table.repositoryId, table.issueId),
    githubIssueLinkWorkspacePostUnique: uniqueIndex('github_issue_link_workspace_post_unique').on(table.workspaceId, table.postId),
    githubIssueLinkWorkspaceIdx: index('github_issue_link_workspace_idx').on(table.workspaceId),
    githubIssueLinkPostIdx: index('github_issue_link_post_idx').on(table.postId),
    githubIssueLinkRepositoryIdx: index('github_issue_link_repository_idx').on(table.repositoryId),
    githubIssueLinkSuggestionStateIdx: index('github_issue_link_suggestion_state_idx').on(table.suggestionState),
  } as const)
)

export type WorkspaceGithubConnection = typeof workspaceGithubConnection.$inferSelect
export type NewWorkspaceGithubConnection = typeof workspaceGithubConnection.$inferInsert
export type GithubIssueLink = typeof githubIssueLink.$inferSelect
export type NewGithubIssueLink = typeof githubIssueLink.$inferInsert
