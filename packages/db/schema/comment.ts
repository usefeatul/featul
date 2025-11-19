import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  uuid,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/pg-core";
import { post } from "./post";
import { user } from "./auth";

export const comment = pgTable(
  "comment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id"),
    content: text("content").notNull(),
    authorId: text("author_id").references(() => user.id, {
      onDelete: "set null",
    }),
    authorName: text("author_name"),
    authorEmail: text("author_email"),
    isAnonymous: boolean("is_anonymous").default(false),
    status: text("status", {
      enum: ["published", "pending", "spam", "deleted", "hidden"],
    }).default("published"),
    upvotes: integer("upvotes").default(0),
    downvotes: integer("downvotes").default(0),
    replyCount: integer("reply_count").default(0),
    depth: integer("depth").default(0),
    isPinned: boolean("is_pinned").default(false),
    isEdited: boolean("is_edited").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
    editedAt: timestamp("edited_at"),
    moderatedBy: text("moderated_by").references(() => user.id),
    moderatedAt: timestamp("moderated_at"),
    moderationReason: text("moderation_reason"),
    metadata: json("metadata").$type<{
      attachments?: { name: string; url: string; type: string }[];
      mentions?: string[];
      editHistory?: { content: string; editedAt: string }[];
    }>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => ({
    commentParentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "comment_parent_id_comment_id_fk",
    }).onDelete('cascade'),
  } as const)
);

// Comment reactions (beyond upvote/downvote)
export const commentReaction = pgTable(
  "comment_reaction",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comment.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["like", "love", "laugh", "angry", "sad", "confused"],
    }).notNull(),
    ipAddress: text("ip_address"),
    fingerprint: text("fingerprint"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    commentReactionUnique: uniqueIndex(
      "comment_reaction_comment_user_type_unique"
    ).on(table.commentId, table.userId, table.type),
  } as const)
);

// Comment mentions for notifications
export const commentMention = pgTable("comment_mention", {
  id: uuid("id").primaryKey().defaultRandom(),
  commentId: uuid("comment_id")
    .notNull()
    .references(() => comment.id, { onDelete: "cascade" }),
  mentionedUserId: text("mentioned_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  mentionedBy: text("mentioned_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Comment reports for moderation
export const commentReport = pgTable("comment_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  commentId: uuid("comment_id")
    .notNull()
    .references(() => comment.id, { onDelete: "cascade" }),
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

export type Comment = typeof comment.$inferSelect;
export type CommentReaction = typeof commentReaction.$inferSelect;
export type CommentMention = typeof commentMention.$inferSelect;
export type CommentReport = typeof commentReport.$inferSelect;
