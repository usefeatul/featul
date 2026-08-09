import { db, brandingConfig, workspace } from "@featul/db";
import { eq } from "drizzle-orm";

export type WorkspaceBranding = {
  primary: string;
  theme: "light" | "dark" | "system";
  sidebarPosition?: "left" | "right";
  layoutStyle?: "compact" | "comfortable" | "spacious";
  hidePoweredBy?: boolean;
};

export async function getBrandingColorsBySlug(
  slug: string
): Promise<{ primary: string }> {
  let primary = "#3b82f6";
  const [row] = await db
    .select({ primaryColor: brandingConfig.primaryColor })
    .from(workspace)
    .leftJoin(brandingConfig, eq(brandingConfig.workspaceId, workspace.id))
    .where(eq(workspace.slug, slug))
    .limit(1);
  if (row?.primaryColor) primary = row.primaryColor;
  return { primary };
}

export async function getBrandingBySlug(
  slug: string
): Promise<WorkspaceBranding> {
  let primary = "#3b82f6";
  let theme: "light" | "dark" | "system" = "system";
  let sidebarPosition: "left" | "right" | undefined;
  let layoutStyle: "compact" | "comfortable" | "spacious" | undefined;
  const [row] = await db
    .select({
      primaryColor: brandingConfig.primaryColor,
      theme: brandingConfig.theme,
      sidebarPosition: brandingConfig.sidebarPosition,
      layoutStyle: brandingConfig.layoutStyle,
      hidePoweredBy: brandingConfig.hidePoweredBy,
      wsPrimary: workspace.primaryColor,
      wsTheme: workspace.theme,
    })
    .from(workspace)
    .leftJoin(brandingConfig, eq(brandingConfig.workspaceId, workspace.id))
    .where(eq(workspace.slug, slug))
    .limit(1);
  if (row?.primaryColor) primary = row.primaryColor;
  else if (row?.wsPrimary) primary = row.wsPrimary;
  if (row?.theme) theme = row.theme as "light" | "dark" | "system";
  else if (row?.wsTheme) theme = row.wsTheme as "light" | "dark" | "system";
  if (row?.sidebarPosition === "left" || row?.sidebarPosition === "right")
    sidebarPosition = row.sidebarPosition;
  if (
    row?.layoutStyle === "compact" ||
    row?.layoutStyle === "comfortable" ||
    row?.layoutStyle === "spacious"
  )
    layoutStyle = row.layoutStyle;
  const hidePoweredBy = Boolean(row?.hidePoweredBy);
  return { primary, theme, sidebarPosition, layoutStyle, hidePoweredBy };
}

export async function getSidebarPositionBySlug(
  slug: string
): Promise<"left" | "right"> {
  const [row] = await db
    .select({ sidebarPosition: brandingConfig.sidebarPosition })
    .from(workspace)
    .leftJoin(brandingConfig, eq(brandingConfig.workspaceId, workspace.id))
    .where(eq(workspace.slug, slug))
    .limit(1);
  return row?.sidebarPosition === "left" ? "left" : "right";
}
