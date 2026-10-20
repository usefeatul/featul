import {
  pgTable,
  text,
  timestamp,
  json,
  integer,
  boolean,
  date,
  uniqueIndex,
  index,
  primaryKey,
  customType,
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
  /** Last sources used to draft articles, prefilled for the next scan. */
  importSiteUrl: text("import_site_url"),
  importRepoUrl: text("import_repo_url"),
  lastImportAt: timestamp("last_import_at"),
  importsTotal: integer("imports_total").notNull().default(0),
  /** `YYYY-MM` the monthly counter belongs to; a new month resets it. */
  importMonth: text("import_month"),
  importsThisMonth: integer("imports_this_month").notNull().default(0),
  /** GitHub App installation that lets scans read the workspace's private repos. */
  githubInstallationId: text("github_installation_id"),
  githubAccountLogin: text("github_account_login"),
  githubConnectedById: text("github_connected_by_id"),
  githubConnectedAt: timestamp("github_connected_at"),
  /**
   * Repos (lowercase `owner/name`) the connecting user could access when they connected. The
   * installation token reaches every repo the app was granted, so scans stay within this list.
   */
  githubRepos: json("github_repos").$type<string[]>(),
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

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });

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
    /*
     * Search fields, filled by the `help_article_search_refresh` trigger (migration 0037) whenever
     * the title, summary or content changes, so no write path can leave them stale.
     */
    /** Plain text of the content. */
    searchText: text("search_text").notNull().default(""),
    /** Title (weight A) and summary (B). */
    headingVector: tsvector("heading_vector"),
    /** Heading plus content text (C). */
    searchVector: tsvector("search_vector"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) =>
    ({
      helpArticleSearchIdx: index("help_article_search_idx").using("gin", table.searchVector),
      helpArticleHeadingSearchIdx: index("help_article_heading_search_idx").using("gin", table.headingVector),
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

/** Per-article counters bucketed by UTC day, so analytics can chart a date range. */
export const helpArticleDaily = pgTable(
  "help_article_daily",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => helpArticle.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    views: integer("views").notNull().default(0),
    helpful: integer("helpful").notNull().default(0),
    notHelpful: integer("not_helpful").notNull().default(0),
  },
  (table) =>
    ({
      pk: primaryKey({ columns: [table.articleId, table.day] }),
      helpArticleDailyWorkspaceIdx: index("help_article_daily_workspace_idx").on(
        table.workspaceId,
        table.day,
      ),
    }) as const,
);

export const helpSearchSource = ["search", "ai"] as const;
export type HelpSearchSource = (typeof helpSearchSource)[number];

/** Settled visitor searches and AI questions, one row per normalized query per day. */
export const helpSearchDaily = pgTable(
  "help_search_daily",
  {
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    source: text("source", { enum: helpSearchSource }).notNull(),
    query: text("query").notNull(),
    count: integer("count").notNull().default(0),
    /** Result count from the most recent occurrence; 0 marks a content gap. */
    results: integer("results").notNull().default(0),
  },
  (table) =>
    ({
      pk: primaryKey({
        columns: [table.workspaceId, table.day, table.source, table.query],
      }),
    }) as const,
);
