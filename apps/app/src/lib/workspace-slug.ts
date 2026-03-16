import { db, workspace } from "@featul/db";
import { eq } from "drizzle-orm";

export type WorkspaceSummaryBySlug = {
  id: string;
  name: string;
  ownerId: string;
};

export type WorkspaceBySlugRecord = WorkspaceSummaryBySlug & {
  slug: string;
  logo?: string | null;
  domain?: string | null;
  customDomain?: string | null;
  plan?: "free" | "starter" | "professional" | null;
  timezone?: string | null;
};

export async function getWorkspaceBySlugRecord(
  slug: string
): Promise<WorkspaceBySlugRecord | null> {
  const [ws] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId,
      logo: workspace.logo,
      domain: workspace.domain,
      customDomain: workspace.customDomain,
      plan: workspace.plan,
      timezone: workspace.timezone,
    })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);

  return ws ?? null;
}

export async function getWorkspaceSummaryBySlug(
  slug: string
): Promise<WorkspaceSummaryBySlug | null> {
  const [ws] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
    })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);

  return ws ?? null;
}

export async function getWorkspaceIdBySlug(slug: string): Promise<string | null> {
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);

  return ws?.id ?? null;
}
