import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { workspace } from "./workspace";
import { user } from "./auth";

export const workspaceNotraConnection = pgTable(
  "workspace_notra_connection",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").notNull(),
    encryptedApiKey: text("encrypted_api_key").notNull(),
    keyVersion: text("key_version").notNull().default("v1"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    lastUsedAt: timestamp("last_used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    workspaceNotraConnectionWorkspaceUnique: uniqueIndex(
      "workspace_notra_connection_workspace_unique",
    ).on(table.workspaceId),
    workspaceNotraConnectionWorkspaceIdx: index(
      "workspace_notra_connection_workspace_idx",
    ).on(table.workspaceId),
  }),
);

export type WorkspaceNotraConnection =
  typeof workspaceNotraConnection.$inferSelect;
export type NewWorkspaceNotraConnection =
  typeof workspaceNotraConnection.$inferInsert;
