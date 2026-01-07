import { pgTable, text, timestamp, boolean, integer, json, uuid, uniqueIndex, foreignKey, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { board } from './feedback'
import { workspace } from './workspace'
import { user } from './auth'

export const post = pgTable(
  'post',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    boardId: text('board_id')
      .notNull()
      .references(() => board.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content').notNull(),
    image: text('image'),
    slug: text('slug').notNull(),
    authorId: text('author_id')
      .references(() => user.id, { onDelete: 'set null' }),
    isAnonymous: boolean('is_anonymous').default(false),
    status: text('status', {
      enum: ['draft', 'published', 'archived', 'spam', 'pending_approval'],
    }).default('published'),
    roadmapStatus: text('roadmap_status'),
    upvotes: integer('upvotes').default(0),
    commentCount: integer('comment_count').default(0),
    isPinned: boolean('is_pinned').default(false),
    isLocked: boolean('is_locked').default(false),
    isFeatured: boolean('is_featured').default(false),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
    metadata: json('metadata').$type<{
      attachments?: { name: string; url: string; type: string }[];
      integrations?: { github?: string; jira?: string };
      customFields?: Record<string, any>;
    }>(),
    metaTitle: text('meta_title'),
    metaDescription: text('meta_description'),
    moderatedBy: text('moderated_by')
      .references(() => user.id),
    moderatedAt: timestamp('moderated_at'),
    moderationReason: text('moderation_reason'),
    duplicateOfId: text('duplicate_of_id'),
  },
  (table) => ({
    postSlugBoardUnique: uniqueIndex('post_slug_board_unique').on(table.boardId, table.slug),
    postDuplicateFk: foreignKey({
      columns: [table.duplicateOfId],
      foreignColumns: [table.id],
      name: 'post_duplicate_of_id_post_id_fk',
    }).onDelete('set null'),
    postBoardIdIdx: index('post_board_id_idx').on(table.boardId),
    postRoadmapStatusIdx: index('post_roadmap_status_idx').on(table.roadmapStatus),
    postCreatedAtIdx: index('post_created_at_idx').on(table.createdAt),
  } as const)
)



export const tag = pgTable(
  'tag',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspace.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    color: text('color').default('#6b7280'),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    tagSlugWorkspaceUnique: uniqueIndex('tag_slug_workspace_unique').on(table.workspaceId, table.slug),
  } as const)
)

export const postTag = pgTable(
  'post_tag',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    postId: text('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tag.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    postTagUnique: uniqueIndex('post_tag_unique').on(table.postId, table.tagId),
    postTagPostIdIdx: index('post_tag_post_id_idx').on(table.postId),
    postTagTagIdIdx: index('post_tag_tag_id_idx').on(table.tagId),
  } as const)
)


export const postUpdate = pgTable('post_update', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  postId: text('post_id')
    .notNull()
    .references(() => post.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const postReport = pgTable("post_report", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  reportedBy: text("reported_by").references(() => user.id, {
    onDelete: "set null",
  }),

  reason: text("reason", {
    enum: ["spam", "harassment", "inappropriate", "off_topic", "other"],
  }).notNull(),
  description: text("description"),

  status: text("status", {
    enum: ["pending", "reviewed", "resolved", "dismissed"],
  }).default("pending"),

  reviewedBy: text("reviewed_by").references(() => user.id),
  reviewedAt: timestamp("reviewed_at"),
  resolution: text("resolution"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const postMerge = pgTable("post_merge", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  sourcePostId: text("source_post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  targetPostId: text("target_post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  mergedBy: text("merged_by")
    .notNull()
    .references(() => user.id, { onDelete: "set null" }),
  mergeType: text("merge_type", {
    enum: ["merge_into", "merge_here"],
  }).notNull(),
  reason: text("reason"),
  metadata: json("metadata").$type<{
    consolidatedVotes?: boolean;
    transferredComments?: boolean;
    transferredTags?: boolean;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  postMergeSourceTargetUnique: uniqueIndex('post_merge_source_target_unique').on(table.sourcePostId, table.targetPostId),
  postMergeSourceIdx: index('post_merge_source_idx').on(table.sourcePostId),
  postMergeTargetIdx: index('post_merge_target_idx').on(table.targetPostId),
} as const));

export const activityLog = pgTable(
  "activity_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    actionType: text("action_type", {
      enum: ["create", "update", "delete"],
    }).notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    title: text("title"),
    metadata: json("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    activityWorkspaceIdx: index("activity_workspace_idx").on(table.workspaceId),
    activityUserIdx: index("activity_user_idx").on(table.userId),
    activityEntityIdx: index("activity_entity_idx").on(table.entity, table.entityId),
    activityCreatedAtIdx: index("activity_created_at_idx").on(table.createdAt),
  } as const),
)

export type Post = typeof post.$inferSelect
export type PostTag = typeof postTag.$inferSelect
export type Tag = typeof tag.$inferSelect
export type PostUpdate = typeof postUpdate.$inferSelect
export type PostReport = typeof postReport.$inferSelect
export type PostMerge = typeof postMerge.$inferSelect
export type ActivityLog = typeof activityLog.$inferSelect
