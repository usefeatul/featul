// src/db/schema/feedback.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  uuid,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { workspace } from './workspace'
import { user } from './auth'

export const board = pgTable(
  'board',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    systemType: text('system_type', { enum: ['roadmap', 'changelog'] }),
    isPublic: boolean('is_public').notNull().default(true),
    isVisible: boolean('is_visible').notNull().default(true),
    isSystem: boolean('is_system').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    allowAnonymous: boolean('allow_anonymous').notNull().default(true),
    requireApproval: boolean('require_approval').notNull().default(false),
    allowVoting: boolean('allow_voting').notNull().default(true),
    allowComments: boolean('allow_comments').notNull().default(true),
    hidePublicMemberIdentity: boolean('hide_public_member_identity').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    roadmapStatuses: json('roadmap_statuses')
      .$type<
        {
          id: string
          name: string
          color: string
          order: number
        }[]
      >()
      .notNull()
      .default([
        { id: 'pending', name: 'Pending', color: '#6b7280', order: 0 },
        { id: 'review', name: 'Review', color: '#a855f7', order: 1 },
        { id: 'planned', name: 'Planned', color: '#6b7280', order: 2 },
        { id: 'progress', name: 'Progress', color: '#f59e0b', order: 3 },
        { id: 'completed', name: 'Completed', color: '#10b981', order: 4 },
        { id: 'closed', name: 'Closed', color: '#ef4444', order: 5 },
      ]),
  },
  (table) => ({
    boardSlugWorkspaceUnique: uniqueIndex('board_slug_workspace_unique').on(
      table.workspaceId,
      table.slug,
    ),
    boardWorkspaceIdIdx: index('board_workspace_id_idx').on(table.workspaceId),
    boardIsSystemIdx: index('board_is_system_idx').on(table.isSystem),
  }),
)


export const boardModerator = pgTable(
  'board_moderator',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    permissions: json('permissions')
      .$type<{
        canModerate: boolean
        canEdit: boolean
        canDelete: boolean
        canPin: boolean
        canChangeStatus: boolean
      }>()
      .notNull()
      .default({
        canModerate: true,
        canEdit: false,
        canDelete: false,
        canPin: true,
        canChangeStatus: true,
      }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    boardModeratorUnique: uniqueIndex(
      'board_moderator_board_user_unique',
    ).on(table.boardId, table.userId),
  }),
)

export type Board = typeof board.$inferSelect
export type BoardModerator = typeof boardModerator.$inferSelect
