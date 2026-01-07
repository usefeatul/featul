import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { workspace } from "./workspace";

// Extended branding configuration
export const brandingConfig = pgTable(
  "branding_config",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    primaryColor: text("primary_color").default("#3b82f6"),
    theme: text("theme", { enum: ["light", "dark", "system"] }).default(
      "system"
    ),
    layoutStyle: text("layout_style", {
      enum: ["compact", "comfortable", "spacious"],
    }).default("comfortable"),
    sidebarPosition: text("sidebar_position", {
      enum: ["left", "right"],
    }).default("right"),
    hidePoweredBy: boolean("hide_powered_by").default(false),
    showWorkspaceName: boolean("show_workspace_name").default(true),
    showLogo: boolean("show_logo").default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) =>
    ({
      brandingWorkspaceUnique: uniqueIndex("branding_workspace_unique").on(
        table.workspaceId
      ),
    }) as const
);

// Predefined color palettes
// export const colorPalette = pgTable("color_palette", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: text("name").notNull(),
//   description: text("description"),
//   colors: json("colors")
//     .$type<{
//       primary: string;
//       secondary: string;
//       accent: string;
//       background: string;
//       text: string;
//     }>()
//     .notNull(),
//   isDefault: boolean("is_default").default(false),
//   isActive: boolean("is_active").default(true),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });

export type BrandingConfig = typeof brandingConfig.$inferSelect;
// export type ColorPalette = typeof colorPalette.$inferSelect;
