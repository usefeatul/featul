import { pgTable, text, timestamp, json, integer, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { workspace } from "./workspace";
import { user } from "./auth";
import { post } from "./post";

/**
 * A feedback post linked to a GitHub issue. GitHub drives the post's roadmap status;
 * the issue fields are a snapshot refreshed from webhooks. Several posts may share one issue.
 */
export const githubIssueLink = pgTable(
  "github_issue_link",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    /** Lowercase `owner/name`. */
    repoFullName: text("repo_full_name").notNull(),
    issueNumber: integer("issue_number").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    state: text("state", { enum: ["open", "closed"] }).notNull(),
    /** GitHub's `state_reason`: completed, not_planned, duplicate, reopened, or null. */
    stateReason: text("state_reason"),
    labels: json("labels").$type<string[]>().notNull().default([]),
    /** GitHub's `updated_at` for the issue; older events are ignored so replays can't roll back. */
    issueUpdatedAt: timestamp("issue_updated_at"),
    linkedBy: text("linked_by").references(() => user.id, { onDelete: "set null" }),
    syncedAt: timestamp("synced_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) =>
    ({
      githubIssueLinkPostUnique: uniqueIndex("github_issue_link_post_unique").on(table.postId),
      githubIssueLinkIssueIdx: index("github_issue_link_issue_idx").on(table.repoFullName, table.issueNumber),
      githubIssueLinkWorkspaceIdx: index("github_issue_link_workspace_idx").on(table.workspaceId),
    }) as const,
);

/** How GitHub issue changes map onto roadmap statuses for a workspace. */
export const githubSyncSettings = pgTable("github_sync_settings", {
  workspaceId: text("workspace_id")
    .primaryKey()
    .references(() => workspace.id, { onDelete: "cascade" }),
  /** Update linked posts' roadmap status when their issue changes. Opt-in. */
  autoStatus: boolean("auto_status").notNull().default(false),
  /** Status for open issues without a progress label. */
  openStatus: text("open_status", { enum: ["review", "planned"] }).notNull().default("planned"),
  /** Open issues with any of these labels (case-insensitive) are "In progress". */
  progressLabels: json("progress_labels").$type<string[]>().notNull().default(["in progress"]),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type GithubIssueLink = typeof githubIssueLink.$inferSelect;
export type GithubSyncSettings = typeof githubSyncSettings.$inferSelect;
