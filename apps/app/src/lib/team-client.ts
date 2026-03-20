import { client } from "@featul/api/client";
import { safeJson } from "@/lib/api-response";
import type { PaginatedActivity } from "@/types/activity";
import type { Member } from "@/types/team";
import {
  EMPTY_MEMBER_STATS,
  type MemberActivityCategory,
  type MemberStats,
  type MemberTopPost,
  type WorkspaceViewer,
} from "@/lib/team";

type MembersResponse = {
  members?: Member[];
};

type ViewerResponse = {
  role?: WorkspaceViewer["role"];
  isOwner?: boolean;
};

type MemberStatsResponse = {
  stats?: MemberStats;
  topPosts?: MemberTopPost[];
};

export { teamQueryKeys } from "@/lib/team-query-keys";
export {
  EMPTY_MEMBER_STATS,
  type MemberActivityCategory,
  type MemberStats,
  type MemberTopPost,
  type WorkspaceViewer,
} from "@/lib/team";

export async function fetchWorkspaceMembers(slug: string): Promise<Member[]> {
  if (!slug) return [];
  const res = await client.team.membersByWorkspaceSlug.$get({ slug });
  const data = await safeJson<MembersResponse>(res);
  return Array.isArray(data?.members) ? data.members : [];
}

export async function fetchWorkspaceViewer(
  slug: string
): Promise<WorkspaceViewer | null> {
  if (!slug) return null;
  const res = await client.team.viewerByWorkspaceSlug.$get({ slug });
  if (!res.ok) return null;
  const data = await safeJson<ViewerResponse>(res);
  return {
    role: data?.role ?? null,
    isOwner: Boolean(data?.isOwner),
  };
}

export async function fetchMemberStats(
  slug: string,
  userId: string
): Promise<{ stats: MemberStats; topPosts: MemberTopPost[] }> {
  if (!slug || !userId) {
    return { stats: EMPTY_MEMBER_STATS, topPosts: [] };
  }
  const res = await client.member.statsByWorkspaceSlug.$get({ slug, userId });
  const data = await safeJson<MemberStatsResponse>(res);
  return {
    stats: data?.stats ?? EMPTY_MEMBER_STATS,
    topPosts: Array.isArray(data?.topPosts) ? data.topPosts : [],
  };
}

export async function fetchMemberActivity(
  slug: string,
  userId: string,
  cursor?: string,
  limit: number = 20,
  filters?: {
    categoryFilter?: MemberActivityCategory;
    statusFilter?: string;
  }
): Promise<PaginatedActivity> {
  if (!slug || !userId) {
    return { items: [], nextCursor: null };
  }
  const res = await client.member.activityByWorkspaceSlug.$get({
    slug,
    userId,
    limit,
    cursor,
    categoryFilter: filters?.categoryFilter ?? "all",
    ...(filters?.statusFilter && filters.statusFilter !== "all"
      ? { statusFilter: filters.statusFilter }
      : {}),
  });
  const data = await safeJson<PaginatedActivity>(res);
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    nextCursor: typeof data?.nextCursor === "string" ? data.nextCursor : null,
  };
}
