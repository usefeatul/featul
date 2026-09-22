import {
  pgTable,
  text,
  timestamp,
  json,
  uniqueIndex,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { board } from "./feedback";
import { user } from "./auth";

export const changelogEntry = pgTable(
  "changelog_entry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: json("content").$type<Record<string, unknown>>().notNull(),
    summary: text("summary"),
    coverImage: text("cover_image"),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["draft", "published"],
    })
      .notNull()
      .default("draft"),
    tags: json("tags").$type<string[]>().notNull().default([]),
    sourceProvider: text("source_provider"),
    sourceExternalId: text("source_external_id"),
    sourceImportedAt: timestamp("source_imported_at"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) =>
    ({
      changelogEntrySlugBoardUnique: uniqueIndex(
        "changelog_entry_slug_board_unique",
      ).on(table.boardId, table.slug),
      changelogEntrySourceUnique: uniqueIndex(
        "changelog_entry_source_unique",
      ).on(table.boardId, table.sourceProvider, table.sourceExternalId),
      changelogEntryBoardIdIdx: index("changelog_entry_board_id_idx").on(
        table.boardId,
      ),
      changelogEntrySourceIdx: index("changelog_entry_source_idx").on(
        table.sourceProvider,
        table.sourceExternalId,
      ),
      changelogEntryStatusIdx: index("changelog_entry_status_idx").on(
        table.status,
      ),
      changelogEntryPublishedAtIdx: index(
        "changelog_entry_published_at_idx",
      ).on(table.publishedAt),
    }) as const,
);

export type ChangelogEntry = typeof changelogEntry.$inferSelect;
export type NewChangelogEntry = typeof changelogEntry.$inferInsert;

export type ChangelogAiStoredMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedTitles?: string[];
  status?: "error";
  activity?: "ask" | "rewrite" | "patch" | "tags";
  durationMs?: number;
  suggestedTags?: string[];
  effect?: string;
};

export const changelogAiConversation = pgTable(
  "changelog_ai_conversation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    boardId: text("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    entryId: text("entry_id").references(() => changelogEntry.id, {
      onDelete: "set null",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    messages: json("messages")
      .$type<ChangelogAiStoredMessage[]>()
      .notNull()
      .default([]),
    selectedPostIds: json("selected_post_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    pendingTagNames: json("pending_tag_names")
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) =>
    ({
      changelogAiConversationOwnerIdx: index(
        "changelog_ai_conversation_owner_idx",
      ).on(table.boardId, table.userId, table.updatedAt),
      changelogAiConversationEntryIdx: index(
        "changelog_ai_conversation_entry_idx",
      ).on(table.entryId),
    }) as const,
);

export type ChangelogAiConversation =
  typeof changelogAiConversation.$inferSelect;
export type NewChangelogAiConversation =
  typeof changelogAiConversation.$inferInsert;

// Changelog mentions for notifications
export const changelogMention = pgTable(
  "changelog_mention",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    entryId: text("entry_id")
      .notNull()
      .references(() => changelogEntry.id, { onDelete: "cascade" }),
    mentionedUserId: text("mentioned_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mentionedBy: text("mentioned_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    isRead: boolean("is_read").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) =>
    ({
      changelogMentionEntryIdx: index("changelog_mention_entry_id_idx").on(
        table.entryId,
      ),
      changelogMentionMentionedUserIdx: index(
        "changelog_mention_mentioned_user_id_idx",
      ).on(table.mentionedUserId),
    }) as const,
);

export type ChangelogMention = typeof changelogMention.$inferSelect;
