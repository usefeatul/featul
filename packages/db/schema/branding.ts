import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  uuid,
} from "drizzle-orm/pg-core";
import { workspace } from "./workspace";
import { user } from "./auth";

// Extended branding configuration
export const brandingConfig = pgTable("branding_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),

  // Logo configurations
  logoUrl: text("logo_url"),
  logoWidth: integer("logo_width").default(120),
  logoHeight: integer("logo_height").default(40),
  faviconUrl: text("favicon_url"),

  // Color scheme
  primaryColor: text("primary_color").default("#3b82f6"),
  secondaryColor: text("secondary_color").default("#6b7280"),
  accentColor: text("accent_color").default("#10b981"),
  backgroundColor: text("background_color").default("#ffffff"),
  textColor: text("text_color").default("#1f2937"),

  // Theme settings
  theme: text("theme", { enum: ["light", "dark", "system", "custom"] }).default(
    "system"
  ),
  customCss: text("custom_css"), // Custom CSS for advanced users

  // Typography
  fontFamily: text("font_family").default("Inter"),
  fontSize: text("font_size", { enum: ["small", "medium", "large"] }).default(
    "medium"
  ),

  // Layout preferences
  layoutStyle: text("layout_style", {
    enum: ["compact", "comfortable", "spacious"],
  }).default("comfortable"),
  sidebarPosition: text("sidebar_position", {
    enum: ["left", "right"],
  }).default("left"),

  // Branding visibility
  hidePoweredBy: boolean("hide_powered_by").default(false),
  showWorkspaceName: boolean("show_workspace_name").default(true),
  showLogo: boolean("show_logo").default(true),

  // Custom domain settings
  customDomain: text("custom_domain"),
  sslEnabled: boolean("ssl_enabled").default(false),
  domainVerified: boolean("domain_verified").default(false),

  // Social and SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),

  // Advanced customization
  customFields: json("custom_fields").$type<{
    headerLinks?: { name: string; url: string; external: boolean }[];
    footerText?: string;
    announcementBar?: { text: string; color: string; enabled: boolean };
    socialLinks?: { platform: string; url: string }[];
  }>(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Predefined color palettes
export const colorPalette = pgTable("color_palette", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  colors: json("colors")
    .$type<{
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    }>()
    .notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Custom themes created by users
export const customTheme = pgTable("custom_theme", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),

  // Theme configuration
  config: json("config")
    .$type<{
      colors: Record<string, string>;
      typography: Record<string, string>;
      spacing: Record<string, string>;
      borderRadius: Record<string, string>;
      shadows: Record<string, string>;
    }>()
    .notNull(),

  // CSS overrides
  customCss: text("custom_css"),

  // Theme metadata
  isActive: boolean("is_active").default(false),
  isPublic: boolean("is_public").default(false), // Can be shared with other workspaces

  createdBy: text("created_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Asset management for branding
export const brandingAsset = pgTable("branding_asset", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspace.id, { onDelete: "cascade" }),

  // Asset details
  name: text("name").notNull(),
  type: text("type", {
    enum: ["logo", "favicon", "background", "icon", "other"],
  }).notNull(),
  url: text("url").notNull(),
  originalName: text("original_name"),
  mimeType: text("mime_type"),
  fileSize: integer("file_size"), // in bytes

  // Image dimensions
  width: integer("width"),
  height: integer("height"),

  // Usage tracking
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),

  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BrandingConfig = typeof brandingConfig.$inferSelect;
export type ColorPalette = typeof colorPalette.$inferSelect;
export type CustomTheme = typeof customTheme.$inferSelect;
export type BrandingAsset = typeof brandingAsset.$inferSelect;
