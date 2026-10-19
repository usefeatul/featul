import { db, workspace, board, changelogEntry } from "@featul/db";
import { and, eq, sql } from "drizzle-orm";
import {
  getBrandingBySlug,
  getWorkspaceBoards,
  getWorkspacePostsCount,
} from "@/lib/workspace";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo: string | null;
};

export type PortalBoard = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  hidePublicMemberIdentity?: boolean;
};

export type PortalStatusCounts = {
  pending: number;
  review: number;
  planned: number;
  progress: number;
  completed: number;
  closed: number;
};

export type SubdomainLayoutData = {
  workspace: WorkspaceRow;
  branding: Awaited<ReturnType<typeof getBrandingBySlug>>;
  changelogVisible: boolean;
  roadmapVisible: boolean;
  boards: PortalBoard[];
  statusCounts: PortalStatusCounts;
  totalPosts: number;
  changelogCount: number;
};

/** Workspace, branding, nav visibility, boards and public counts for the portal shell. */
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

  const [
    branding,
    changelogVisible,
    roadmapVisible,
    boards,
    totalPosts,
    planned,
    progress,
    completed,
    review,
    pending,
    closed,
  ] = await Promise.all([
    getBrandingBySlug(subdomain),
    getSystemBoardVisibility(ws.id, "changelog"),
    getSystemBoardVisibility(ws.id, "roadmap"),
    getWorkspaceBoards(subdomain),
    getWorkspacePostsCount(subdomain, { publicOnly: true }),
    getWorkspacePostsCount(subdomain, { statuses: ["planned"], publicOnly: true }),
    getWorkspacePostsCount(subdomain, { statuses: ["progress"], publicOnly: true }),
    getWorkspacePostsCount(subdomain, { statuses: ["completed"], publicOnly: true }),
    getWorkspacePostsCount(subdomain, { statuses: ["review"], publicOnly: true }),
    getWorkspacePostsCount(subdomain, { statuses: ["pending"], publicOnly: true }),
    getWorkspacePostsCount(subdomain, { statuses: ["closed"], publicOnly: true }),
  ]);

  const changelogCount = changelogVisible
    ? await getPublishedChangelogCount(ws.id)
    : 0;

  return {
    workspace: ws,
    branding,
    changelogVisible,
    roadmapVisible,
    boards,
    statusCounts: { pending, review, planned, progress, completed, closed },
    totalPosts,
    changelogCount,
  };
}

/** True when the system board exists and is both visible and public. */
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

/** Published changelog entries on the workspace's changelog board. */
async function getPublishedChangelogCount(workspaceId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(changelogEntry)
    .innerJoin(board, eq(changelogEntry.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, workspaceId),
        eq(board.systemType, "changelog"),
        eq(changelogEntry.status, "published")
      )
    );
  return Number(row?.count || 0);
}
