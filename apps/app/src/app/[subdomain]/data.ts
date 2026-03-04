import { db, workspace, board } from "@featul/db";
import { and, eq } from "drizzle-orm";
import { getBrandingBySlug } from "@/lib/workspace";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo: string | null;
};

export type SubdomainLayoutData = {
  workspace: WorkspaceRow;
  branding: Awaited<ReturnType<typeof getBrandingBySlug>>;
  changelogVisible: boolean;
  roadmapVisible: boolean;
};

export async function loadSubdomainLayoutData(
  subdomain: string
): Promise<SubdomainLayoutData | null> {
  const [ws] = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      domain: workspace.domain,
      logo: workspace.logo,
    })
    .from(workspace)
    .where(eq(workspace.slug, subdomain))
    .limit(1);

  if (!ws) return null;

  const branding = await getBrandingBySlug(subdomain);

  const changelogVisible = await getSystemBoardVisibility(ws.id, "changelog");
  const roadmapVisible = await getSystemBoardVisibility(ws.id, "roadmap");

  return {
    workspace: ws,
    branding,
    changelogVisible,
    roadmapVisible,
  };
}

async function getSystemBoardVisibility(
  workspaceId: string,
  systemType: "changelog" | "roadmap"
): Promise<boolean> {
  const [b] = await db
    .select({
      id: board.id,
      isVisible: board.isVisible,
      isPublic: board.isPublic,
    })
    .from(board)
    .where(
      and(
        eq(board.workspaceId, workspaceId),
        eq(board.systemType, systemType)
      )
    )
    .limit(1);

  return Boolean(b?.isVisible) && Boolean(b?.isPublic);
}

