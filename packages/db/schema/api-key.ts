import { pgTable, text, timestamp, json, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { workspace } from "./workspace";
import { user } from "./auth";

/**
 * Workspace API keys for the public REST API (`/api/v1/*`), e.g. publishing changelog entries from CI.
 * Only a SHA-256 hash of the secret is stored; the plain key is shown once when it is created.
 * A key acts as its creator, so it stops working if that person loses access to the workspace.
 */
export const workspaceApiKey = pgTable(
  "workspace_api_key",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** First characters of the key, shown in settings so people can tell keys apart. */
    prefix: text("prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    scopes: json("scopes").$type<string[]>().notNull().default([]),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    lastUsedAt: timestamp("last_used_at"),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) =>
    ({
      workspaceApiKeyHashUnique: uniqueIndex("workspace_api_key_hash_unique").on(table.keyHash),
      workspaceApiKeyWorkspaceIdx: index("workspace_api_key_workspace_idx").on(table.workspaceId),
    }) as const,
);

export type WorkspaceApiKey = typeof workspaceApiKey.$inferSelect;
export type NewWorkspaceApiKey = typeof workspaceApiKey.$inferInsert;
