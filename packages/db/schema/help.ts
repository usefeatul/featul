import {
  pgTable,
  text,
  timestamp,
  json,
  integer,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./auth";
import { workspace } from "./workspace";

/** One row per workspace; a missing row means the help center is visible once it has published articles. */
export const helpCenter = pgTable("help_center", {
  workspaceId: text("workspace_id")
    .primaryKey()
    .references(() => workspace.id, { onDelete: "cascade" }),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type HelpCenter = typeof helpCenter.$inferSelect;

/** Top-level grouping on the help center home page (Getting started, Billing, ...). */
export const helpCollection = pgTable(
  "help_collection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    /** Key into the app's collection icon set, not a URL. */
    icon: text("icon").notNull().default("book"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) =>
    ({
      helpCollectionSlugUnique: uniqueIndex("help_collection_slug_unique").on(
        table.workspaceId,
        table.slug,
      ),
      helpCollectionWorkspaceIdx: index("help_collection_workspace_idx").on(
        table.workspaceId,
        table.position,
      ),
    }) as const,
);

export type HelpCollection = typeof helpCollection.$inferSelect;
export type NewHelpCollection = typeof helpCollection.$inferInsert;

export const helpArticle = pgTable(
  "help_article",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    /** Deleting a collection leaves its articles uncategorized rather than deleting them. */
    collectionId: text("collection_id").references(() => helpCollection.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary"),
    content: json("content").$type<Record<string, unknown>>().notNull(),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    helpfulCount: integer("helpful_count").notNull().default(0),
    notHelpfulCount: integer("not_helpful_count").notNull().default(0),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) =>
    ({
      helpArticleSlugUnique: uniqueIndex("help_article_slug_unique").on(
        table.workspaceId,
        table.slug,
      ),
      helpArticleWorkspaceStatusIdx: index("help_article_workspace_status_idx").on(
        table.workspaceId,
        table.status,
      ),
      helpArticleCollectionIdx: index("help_article_collection_idx").on(
        table.collectionId,
        table.position,
      ),
    }) as const,
);

export type HelpArticle = typeof helpArticle.$inferSelect;
export type NewHelpArticle = typeof helpArticle.$inferInsert;
