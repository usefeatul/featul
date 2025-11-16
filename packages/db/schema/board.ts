// src/db/schema/board.ts
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  uuid,
  uniqueIndex,
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
    description: text('description'),
    type: text('type', { enum: ['feedback', 'updates', 'roadmap'] })
      .notNull()
      .default('feedback'),
    isPublic: boolean('is_public').notNull().default(true),
    isActive: boolean('is_active').notNull().default(true),
    allowAnonymous: boolean('allow_anonymous').notNull().default(true),
    requireApproval: boolean('require_approval').notNull().default(false),
    allowVoting: boolean('allow_voting').notNull().default(true),
    allowComments: boolean('allow_comments').notNull().default(true),
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
      // If your Drizzle version supports it, this will auto-update the timestamp on UPDATE
      .$onUpdate(() => new Date()),
    color: text('color').notNull().default('#3b82f6'),
    icon: text('icon'),
    welcomeMessage: text('welcome_message'),
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
        { id: 'planned', name: 'Planned', color: '#6b7280', order: 0 },
        { id: 'in-progress', name: 'In Progress', color: '#f59e0b', order: 1 },
        { id: 'completed', name: 'Completed', color: '#10b981', order: 2 },
      ]),
  },
  (table) => ({
    boardSlugWorkspaceUnique: uniqueIndex('board_slug_workspace_unique').on(
      table.workspaceId,
      table.slug,
    ),
  }),
)

export const boardCategory = pgTable(
  'board_category',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    color: text('color').notNull().default('#6b7280'),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    boardCategorySlugUnique: uniqueIndex(
      'board_category_slug_board_unique',
    ).on(table.boardId, table.slug),
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
export type BoardCategory = typeof boardCategory.$inferSelect
export type BoardModerator = typeof boardModerator.$inferSelect
