import { pgTable, text, timestamp, json, uuid, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { board } from './feedback'
import { user } from './auth'

export const changelogEntry = pgTable(
  'changelog_entry',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    boardId: uuid('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    content: json('content').$type<Record<string, unknown>>().notNull(),
    summary: text('summary'),
    coverImage: text('cover_image'),
    authorId: text('author_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    status: text('status', {
      enum: ['draft', 'published', 'archived'],
    }).notNull().default('draft'),
    tags: json('tags').$type<string[]>().notNull().default([]),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    changelogEntrySlugBoardUnique: uniqueIndex('changelog_entry_slug_board_unique').on(table.boardId, table.slug),
    changelogEntryBoardIdIdx: index('changelog_entry_board_id_idx').on(table.boardId),
    changelogEntryStatusIdx: index('changelog_entry_status_idx').on(table.status),
    changelogEntryPublishedAtIdx: index('changelog_entry_published_at_idx').on(table.publishedAt),
  } as const)
)

export type ChangelogEntry = typeof changelogEntry.$inferSelect
export type NewChangelogEntry = typeof changelogEntry.$inferInsert

