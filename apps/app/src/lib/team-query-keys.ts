import type { MemberActivityCategory } from "@/lib/team"

export const teamQueryKeys = {
  members: (slug: string) => ["members", slug] as const,
  viewer: (slug: string, userId: string | null) =>
    ["workspace-viewer", slug, userId] as const,
  memberStats: (slug: string, userId: string) =>
    ["member-stats", slug, userId] as const,
  memberActivity: (
    slug: string,
    userId: string,
    categoryFilter: MemberActivityCategory,
    statusFilter: string,
  ) =>
    [
      "member-activity",
      slug,
      userId,
      categoryFilter,
      statusFilter,
    ] as const,
}
