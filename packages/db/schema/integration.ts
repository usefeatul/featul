import { pgTable, text, timestamp, boolean, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { workspace } from './workspace'

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
