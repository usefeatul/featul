import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { workspace } from "./workspace";

export const widgetUser = pgTable(
  "widget_user",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    workspaceExternalIdUnique: uniqueIndex(
      "widget_user_workspace_external_id_unique",
    ).on(table.workspaceId, table.externalId),
    workspaceEmailIndex: index("widget_user_workspace_email_idx").on(
      table.workspaceId,
      table.email,
    ),
  }),
);

export type WidgetUser = typeof widgetUser.$inferSelect;
