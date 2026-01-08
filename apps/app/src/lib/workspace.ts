import {
  db,
  workspace,
  workspaceMember,
  brandingConfig,
  board,
  post,
  postTag,
  tag,
  workspaceDomain,
  workspaceInvite,
  user,
  workspaceIntegration,
} from "@featul/db";
import { randomAvatarUrl } from "@/utils/avatar";
import { eq, and, inArray, desc, asc, sql } from "drizzle-orm";
import { createHash } from "crypto";
import type { BrandingConfig } from "../types/branding";

export async function findFirstAccessibleWorkspaceSlug(
  userId: string
): Promise<string | null> {
  const [owned] = await db
    .select({ slug: workspace.slug })
    .from(workspace)
    .where(eq(workspace.ownerId, userId))
    .limit(1);

  if (owned?.slug) return owned.slug;

  const [memberWs] = await db
    .select({ slug: workspace.slug })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
    .where(
      and(
        eq(workspaceMember.userId, userId),
        eq(workspaceMember.isActive, true)
      )
    )
    .limit(1);

  return memberWs?.slug || null;
}

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
): Promise<{
  primary: string;
  theme: "light" | "dark" | "system";
  sidebarPosition?: "left" | "right";
  layoutStyle?: "compact" | "comfortable" | "spacious";
  hidePoweredBy?: boolean;
}> {
  let primary = "#3b82f6";
  let theme: "light" | "dark" | "system" = "system";
  let sidebarPosition: "left" | "right" | undefined;
  let layoutStyle: "compact" | "comfortable" | "spacious" | undefined;
  let hidePoweredBy: boolean | undefined;
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
  if (row?.theme) theme = row.theme as any;
  else if (row?.wsTheme) theme = row.wsTheme as any;
  if (row?.sidebarPosition === "left" || row?.sidebarPosition === "right")
    sidebarPosition = row.sidebarPosition as any;
  if (
    row?.layoutStyle === "compact" ||
    row?.layoutStyle === "comfortable" ||
    row?.layoutStyle === "spacious"
  )
    layoutStyle = row.layoutStyle as any;
  hidePoweredBy = Boolean((row as any)?.hidePoweredBy);
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

export function normalizeStatus(s: string): string {
  const raw = (s || "").trim().toLowerCase();
  const t = raw.replace(/-/g, "");
  const map: Record<string, string> = {
    pending: "pending",
    review: "review",
    planned: "planned",
    progress: "progress",
    completed: "completed",
    closed: "closed",
  };
  return map[t] || raw;
}

export async function getWorkspaceBySlug(
  slug: string
): Promise<{
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logo?: string | null;
  domain?: string | null;
  customDomain?: string | null;
  plan?: "free" | "starter" | "professional" | null;
} | null> {
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
    })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  return ws || null;
}

export async function getWorkspaceDomainInfoBySlug(
  slug: string
): Promise<{ domain: { status: string; host?: string } | null } | null> {
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  if (!ws) return { domain: null };
  const [d] = await db
    .select({ status: workspaceDomain.status, host: workspaceDomain.host })
    .from(workspaceDomain)
    .where(eq(workspaceDomain.workspaceId, ws.id))
    .limit(1);
  if (!d) return { domain: null };
  return { domain: { status: (d as any).status, host: (d as any).host } };
}

export async function getWorkspaceTimezoneBySlug(
  slug: string
): Promise<string | null> {
  const [ws] = await db
    .select({ timezone: workspace.timezone })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  return (ws as any)?.timezone || null;
}

export async function listUserWorkspaces(
  userId: string
): Promise<
  Array<{ id: string; name: string; slug: string; logo?: string | null; plan?: "free" | "starter" | "professional" | null }>
> {
  const owned = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logo: workspace.logo,
      plan: workspace.plan,
    })
    .from(workspace)
    .where(eq(workspace.ownerId, userId));

  const memberRows = await db
    .select({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      logo: workspace.logo,
      plan: workspace.plan,
    })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspaceMember.workspaceId, workspace.id))
    .where(
      and(
        eq(workspaceMember.userId, userId),
        eq(workspaceMember.isActive, true)
      )
    );

  const map = new Map<
    string,
    { id: string; name: string; slug: string; logo?: string | null; plan?: "free" | "starter" | "professional" | null }
  >();
  for (const w of owned.concat(memberRows)) map.set(w.id, w as any);
  return Array.from(map.values());
}

export async function getWorkspacePosts(
  slug: string,
  opts?: {
    statuses?: string[];
    boardSlugs?: string[];
    tagSlugs?: string[];
    order?: "newest" | "oldest" | "likes";
    search?: string;
    limit?: number;
    offset?: number;
    // When true, only include posts from public boards.
    // Used for public-facing subdomain pages so that
    // posts in private boards are fully hidden.
    publicOnly?: boolean;
  }
) {
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return [];

  const normalizedStatuses = (opts?.statuses || [])
    .map(normalizeStatus)
    .filter(Boolean);
  const matchStatuses = Array.from(new Set(normalizedStatuses));
  const boardSlugs = (opts?.boardSlugs || [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const tagSlugs = (opts?.tagSlugs || [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const orderParam = String(opts?.order || "newest").toLowerCase();
  const order = orderParam === "oldest" ? asc(post.createdAt) : orderParam === "likes" ? desc(post.upvotes) : desc(post.createdAt);
  const search = (opts?.search || "").trim();
  const lim = Math.min(Math.max(Number(opts?.limit ?? 50), 1), 5000);
  const off = Math.max(Number(opts?.offset ?? 0), 0);
   const publicOnly = Boolean(opts?.publicOnly);

  let tagPostIds: string[] | null = null;
  if (tagSlugs.length > 0) {
    const rows = await db
      .select({ postId: postTag.postId })
      .from(postTag)
      .innerJoin(tag, eq(postTag.tagId, tag.id))
      .innerJoin(post, eq(postTag.postId, post.id))
      .innerJoin(board, eq(post.boardId, board.id))
      .where(
        and(
          eq(board.workspaceId, ws.id),
          eq(board.isSystem, false),
          ...(publicOnly ? [eq(board.isPublic, true)] : []),
          inArray(tag.slug, tagSlugs)
        )
      );
    tagPostIds = Array.from(new Set(rows.map((r) => r.postId)));
    if (tagPostIds.length === 0) {
      return [];
    }
  }

  const filters: any[] = [
    eq(board.workspaceId, ws.id),
    eq(board.isSystem, false),
  ];
  if (publicOnly) filters.push(eq(board.isPublic, true));
  if (matchStatuses.length > 0)
    filters.push(inArray(post.roadmapStatus, matchStatuses));
  if (boardSlugs.length > 0) filters.push(inArray(board.slug, boardSlugs));
  if (tagPostIds) filters.push(inArray(post.id, tagPostIds));
  if (search) {
    filters.push(
      sql`to_tsvector('english', coalesce(${post.title}, '') || ' ' || coalesce(${post.content}, '')) @@ plainto_tsquery('english', ${search})`
    );
  }

  const rows = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      image: post.image,
      commentCount: post.commentCount,
      upvotes: post.upvotes,
      roadmapStatus: post.roadmapStatus,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      boardSlug: board.slug,
      boardName: board.name,
      authorImage: user.image,
      authorName: user.name,
      isAnonymous: post.isAnonymous,
      authorId: post.authorId,
      metadata: post.metadata,
      role: workspaceMember.role,
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .leftJoin(user, eq(post.authorId, user.id))
    .leftJoin(workspaceMember, and(eq(workspaceMember.userId, post.authorId), eq(workspaceMember.workspaceId, ws.id)))
    .where(and(...filters) as any)
    .orderBy(order)
    .limit(lim)
    .offset(off);

  const withAvatars = rows.map((r) => {
    let avatarSeed = r.id || r.slug
    if (r.isAnonymous && (r.metadata as any)?.fingerprint) {
      avatarSeed = createHash("sha256").update((r.metadata as any).fingerprint).digest("hex")
    }

    return {
      ...r,
      isOwner: r.authorId === ws.ownerId,
      isFeatul: r.authorId === "featul-founder",
      authorImage: !r.isAnonymous
        ? r.authorImage || randomAvatarUrl(r.id || r.slug)
        : randomAvatarUrl(avatarSeed),
    }
  });

  return withAvatars;
}

export async function getWorkspacePostsCount(
  slug: string,
  opts?: {
    statuses?: string[];
    boardSlugs?: string[];
    tagSlugs?: string[];
    search?: string;
    // When true, only count posts from public boards.
    // Used for public-facing subdomain pages so that
    // counts match the visible (public) posts.
    publicOnly?: boolean;
  }
) {
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return 0;

  const normalizedStatuses = (opts?.statuses || [])
    .map(normalizeStatus)
    .filter(Boolean);
  const matchStatuses = Array.from(new Set(normalizedStatuses));
  const boardSlugs = (opts?.boardSlugs || [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const tagSlugs = (opts?.tagSlugs || [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const search = (opts?.search || "").trim();
  const publicOnly = Boolean(opts?.publicOnly);

  let tagPostIds: string[] | null = null;
  if (tagSlugs.length > 0) {
    const rows = await db
      .select({ postId: postTag.postId })
      .from(postTag)
      .innerJoin(tag, eq(postTag.tagId, tag.id))
      .innerJoin(post, eq(postTag.postId, post.id))
      .innerJoin(board, eq(post.boardId, board.id))
      .where(
        and(
          eq(board.workspaceId, ws.id),
          eq(board.isSystem, false),
          ...(publicOnly ? [eq(board.isPublic, true)] : []),
          inArray(tag.slug, tagSlugs)
        )
      );
    tagPostIds = Array.from(new Set(rows.map((r) => r.postId)));
    if (tagPostIds.length === 0) {
      return 0;
    }
  }

  const filters: any[] = [
    eq(board.workspaceId, ws.id),
    eq(board.isSystem, false),
  ];
  if (publicOnly) filters.push(eq(board.isPublic, true));
  if (matchStatuses.length > 0)
    filters.push(inArray(post.roadmapStatus, matchStatuses));
  if (boardSlugs.length > 0) filters.push(inArray(board.slug, boardSlugs));
  if (tagPostIds) filters.push(inArray(post.id, tagPostIds));
  if (search) {
    filters.push(
      sql`to_tsvector('english', coalesce(${post.title}, '') || ' ' || coalesce(${post.content}, '')) @@ plainto_tsquery('english', ${search})`
    );
  }

  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(...filters) as any)
    .limit(1);

  return Number((row as any)?.count || 0);
}
export async function getWorkspaceStatusCounts(
  slug: string
): Promise<Record<string, number>> {
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return {};

  const rows = await db
    .select({ status: post.roadmapStatus, count: sql<number>`count(*)` })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false)))
    .groupBy(post.roadmapStatus);

  const counts: Record<string, number> = {};
  for (const r of rows as any[]) {
    const s = normalizeStatus(String(r.status));
    counts[s] = (counts[s] || 0) + Number(r.count);
  }
  for (const key of [
    "planned",
    "progress",
    "review",
    "completed",
    "pending",
    "closed",
  ]) {
    if (typeof counts[key] !== "number") counts[key] = 0;
  }
  return counts;
}

export async function getWorkspaceBoards(
  slug: string
): Promise<
  Array<{ id: string; name: string; slug: string; postCount: number; hidePublicMemberIdentity?: boolean }>
> {
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return [];
  const rows = await db
    .select({
      id: board.id,
      name: board.name,
      slug: board.slug,
      hidePublicMemberIdentity: board.hidePublicMemberIdentity,
      postCount: sql<number>`count(${post.id})`,
    })
    .from(board)
    .leftJoin(post, eq(post.boardId, board.id))
    .where(
      and(
        eq(board.workspaceId, ws.id),
        eq(board.isSystem, false),
        // Only include public boards in the public workspace feed.
        // Private boards should never appear on the public sidebar,
        // even briefly on initial page load.
        eq(board.isPublic, true)
      )
    )
    .orderBy(asc(board.name))
    .groupBy(board.id);
  return (rows as any[]).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    postCount: Number(r.postCount || 0),
    hidePublicMemberIdentity: Boolean(r.hidePublicMemberIdentity),
  }));
}

export async function getPlannedRoadmapPosts(
  slug: string,
  opts?: { limit?: number; offset?: number; order?: "newest" | "oldest" }
) {
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return [];

  const [rb] = await db
    .select({
      isVisible: board.isVisible,
      isPublic: board.isPublic,
    })
    .from(board)
    .where(
      and(
        eq(board.workspaceId, ws.id),
        eq(board.systemType, "roadmap" as any)
      )
    )
    .limit(1);

  if (!rb?.isVisible || !rb?.isPublic) return [];

  const limit = opts?.limit;
  const offset = opts?.offset;
  const order = opts?.order;
  return getWorkspacePosts(slug, {
    statuses: ["planned"],
    limit,
    offset,
    order,
    publicOnly: true,
  });
}
export async function getBoardByWorkspaceSlug(
  slug: string,
  boardSlug: string
): Promise<{ name: string; slug: string } | null> {
  const [ws] = await db
    .select({ id: workspace.id })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  if (!ws?.id) return null;
  const [b] = await db
    .select({ name: board.name, slug: board.slug })
    .from(board)
    .where(
      and(
        eq(board.workspaceId, ws.id),
        eq(board.isSystem, false),
        eq(board.slug, boardSlug)
      )
    )
    .limit(1);
  return b || null;
}

export async function getSettingsInitialData(
  slug: string,
  meId?: string
): Promise<{
  initialPlan?: string;
  initialWorkspaceId?: string;
  initialWorkspaceName?: string;
  initialTeam?: { members: any[]; invites: any[]; meId: string | null };
  initialChangelogVisible?: boolean;
  initialChangelogTags?: any[];
  initialHidePoweredBy?: boolean;
  initialBrandingConfig?: BrandingConfig | null;
  initialDomainInfo?: any;
  initialDefaultDomain?: string;
  initialFeedbackBoards?: any[];
  initialFeedbackTags?: any[];
  initialIntegrations?: any[];
}> {
  const [ws] = await db
    .select({
      id: workspace.id,
      plan: workspace.plan,
      name: workspace.name,
      logo: workspace.logo,
      ownerId: workspace.ownerId,
      domain: workspace.domain,
    })
    .from(workspace)
    .where(eq(workspace.slug, slug))
    .limit(1);
  if (!ws?.id) return {};

  const [b] = await db
    .select({
      isVisible: board.isVisible,
      isPublic: board.isPublic,
      changelogTags: board.changelogTags,
    })
    .from(board)
    .where(
      and(
        eq(board.workspaceId, ws.id),
        eq(board.systemType, "changelog" as any)
      )
    )
    .limit(1);

  const [br] = await db
    .select({ hidePoweredBy: brandingConfig.hidePoweredBy })
    .from(brandingConfig)
    .where(eq(brandingConfig.workspaceId, ws.id))
    .limit(1);

  const branding = await getBrandingBySlug(slug);

  const members = await db
    .select({
      userId: workspaceMember.userId,
      role: workspaceMember.role,
      joinedAt: workspaceMember.joinedAt,
      isActive: workspaceMember.isActive,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(workspaceMember)
    .innerJoin(user, eq(user.id, workspaceMember.userId))
    .where(eq(workspaceMember.workspaceId, ws.id));

  const invites = await db
    .select({
      id: workspaceInvite.id,
      email: workspaceInvite.email,
      role: workspaceInvite.role,
      invitedBy: workspaceInvite.invitedBy,
      expiresAt: workspaceInvite.expiresAt,
      acceptedAt: workspaceInvite.acceptedAt,
      createdAt: workspaceInvite.createdAt,
    })
    .from(workspaceInvite)
    .where(eq(workspaceInvite.workspaceId, ws.id));

  const [d] = await db
    .select({
      id: workspaceDomain.id,
      host: workspaceDomain.host,
      cnameName: workspaceDomain.cnameName,
      cnameTarget: workspaceDomain.cnameTarget,
      txtName: workspaceDomain.txtName,
      txtValue: workspaceDomain.txtValue,
      status: workspaceDomain.status,
    })
    .from(workspaceDomain)
    .where(eq(workspaceDomain.workspaceId, ws.id))
    .limit(1);

  const feedbackBoardsNonSystem = await db
    .select({
      id: board.id,
      name: board.name,
      slug: board.slug,
      isPublic: board.isPublic,
      isVisible: board.isVisible,
      isActive: board.isActive,
      allowAnonymous: board.allowAnonymous,
      allowComments: board.allowComments,
      hidePublicMemberIdentity: board.hidePublicMemberIdentity,
      sortOrder: board.sortOrder,
      postCount: sql<number>`count(${post.id})`,
    })
    .from(board)
    .leftJoin(post, eq(post.boardId, board.id))
    .where(and(eq(board.workspaceId, ws.id), eq(board.isSystem, false)))
    .groupBy(board.id)
    .orderBy(asc(board.sortOrder), asc(board.createdAt));

  const feedbackRoadmap = await db
    .select({
      id: board.id,
      name: board.name,
      slug: board.slug,
      isPublic: board.isPublic,
      isVisible: board.isVisible,
      isActive: board.isActive,
      allowAnonymous: board.allowAnonymous,
      allowComments: board.allowComments,
      hidePublicMemberIdentity: board.hidePublicMemberIdentity,
      sortOrder: board.sortOrder,
      postCount: sql<number>`count(${post.id})`,
    })
    .from(board)
    .leftJoin(post, eq(post.boardId, board.id))
    .where(and(eq(board.workspaceId, ws.id), eq(board.systemType, "roadmap" as any)))
    .groupBy(board.id)
    .orderBy(asc(board.sortOrder), asc(board.createdAt));

  const feedbackBoards = [...feedbackRoadmap, ...feedbackBoardsNonSystem]

  const feedbackTagsRows = await db
    .select({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      color: tag.color,
      count: sql<number>`count(${board.id})`,
    })
    .from(tag)
    .leftJoin(postTag, eq(postTag.tagId, tag.id))
    .leftJoin(post, eq(postTag.postId, post.id))
    .leftJoin(
      board,
      and(eq(post.boardId, board.id), eq(board.workspaceId, ws.id), eq(board.isSystem, false))
    )
    .where(eq(tag.workspaceId, ws.id))
    .groupBy(tag.id, tag.name, tag.slug, tag.color)

  // Fetch integrations for the workspace
  const integrationsRows = await db
    .select({
      id: workspaceIntegration.id,
      type: workspaceIntegration.type,
      isActive: workspaceIntegration.isActive,
      lastTriggeredAt: workspaceIntegration.lastTriggeredAt,
      createdAt: workspaceIntegration.createdAt,
    })
    .from(workspaceIntegration)
    .where(eq(workspaceIntegration.workspaceId, ws.id));

  return {
    initialPlan: String((ws as any)?.plan || "free"),
    initialWorkspaceId: ws.id,
    initialWorkspaceName: String((ws as any)?.name || ""),
    initialTeam: {
      members: members.map((m) => ({
        ...m,
        isOwner:
          String((ws as any)?.ownerId || "") ===
          String((m as any)?.userId || ""),
      })),
      invites,
      meId: meId || null,
    },
    initialChangelogVisible: Boolean(b?.isVisible),
    initialChangelogTags: Array.isArray((b as any)?.changelogTags)
      ? (b as any)?.changelogTags
      : [],
    initialHidePoweredBy: Boolean((br as any)?.hidePoweredBy),
    initialBrandingConfig: {
      logoUrl: (ws as any)?.logo || undefined,
      primaryColor: branding.primary,
      theme: branding.theme,
      layoutStyle: branding.layoutStyle,
      sidebarPosition: branding.sidebarPosition,
      hidePoweredBy: branding.hidePoweredBy,
    },
    initialDomainInfo: d || null,
    initialDefaultDomain: String((ws as any)?.domain || ""),
    initialFeedbackBoards: feedbackBoards.map((b: any) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      isPublic: Boolean(b.isPublic),
      isVisible: Boolean(b.isVisible),
      isActive: Boolean(b.isActive),
      allowAnonymous: Boolean(b.allowAnonymous),
      allowComments: Boolean(b.allowComments),
      hidePublicMemberIdentity: Boolean(b.hidePublicMemberIdentity),
      sortOrder: Number(b.sortOrder || 0),
      postCount: Number(b.postCount || 0),
    })),
    initialFeedbackTags: feedbackTagsRows.map((t: any) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      postCount: Number(t.count || 0),
    })),
    initialIntegrations: integrationsRows.map((i: any) => ({
      id: i.id,
      type: i.type,
      isActive: Boolean(i.isActive),
      lastTriggeredAt: i.lastTriggeredAt,
      createdAt: i.createdAt,
    })),
  };
}

export async function getPostNavigation(
  slug: string,
  currentPostId: string,
  opts?: {
    statuses?: string[];
    boardSlugs?: string[];
    tagSlugs?: string[];
    order?: "newest" | "oldest" | "likes";
    search?: string;
  }
) {
  const ws = await getWorkspaceBySlug(slug);
  if (!ws) return { prev: null, next: null };

  const normalizedStatuses = (opts?.statuses || [])
    .map(normalizeStatus)
    .filter(Boolean);
  const matchStatuses = Array.from(new Set(normalizedStatuses));
  const boardSlugs = (opts?.boardSlugs || [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const tagSlugs = (opts?.tagSlugs || [])
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const orderParam = String(opts?.order || "newest").toLowerCase();
  const order = orderParam === "oldest" ? asc(post.createdAt) : orderParam === "likes" ? desc(post.upvotes) : desc(post.createdAt);
  const search = (opts?.search || "").trim();

  let tagPostIds: string[] | null = null;
  if (tagSlugs.length > 0) {
    const rows = await db
      .select({ postId: postTag.postId })
      .from(postTag)
      .innerJoin(tag, eq(postTag.tagId, tag.id))
      .innerJoin(post, eq(postTag.postId, post.id))
      .innerJoin(board, eq(post.boardId, board.id))
      .where(
        and(
          eq(board.workspaceId, ws.id),
          eq(board.isSystem, false),
          inArray(tag.slug, tagSlugs)
        )
      );
    tagPostIds = Array.from(new Set(rows.map((r) => r.postId)));
    if (tagPostIds.length === 0) {
      return { prev: null, next: null };
    }
  }

  const filters: any[] = [
    eq(board.workspaceId, ws.id),
    eq(board.isSystem, false),
  ];
  if (matchStatuses.length > 0)
    filters.push(inArray(post.roadmapStatus, matchStatuses));
  if (boardSlugs.length > 0) filters.push(inArray(board.slug, boardSlugs));
  if (tagPostIds) filters.push(inArray(post.id, tagPostIds));
  if (search) {
    filters.push(
      sql`to_tsvector('english', coalesce(${post.title}, '') || ' ' || coalesce(${post.content}, '')) @@ plainto_tsquery('english', ${search})`
    );
  }

  const rows = await db
    .select({
      id: post.id,
      title: post.title,
      slug: post.slug,
    })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(...filters) as any)
    .orderBy(order);

  const idx = rows.findIndex((p) => p.id === currentPostId);
  if (idx === -1) return { prev: null, next: null };

  return {
    prev: idx > 0 ? rows[idx - 1] : null,
    next: idx < rows.length - 1 ? rows[idx + 1] : null,
  };
}
