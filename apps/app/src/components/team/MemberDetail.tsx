"use client"

import React from "react"
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import type { Member } from "@/types/team"
import type { ActivityItem, PaginatedActivity } from "@/types/activity"
import { MemberHeader } from "@/components/team/MemberHeader"
import { MemberActivity } from "@/components/team/MemberActivity"
import { MemberTopPosts } from "@/components/team/MemberTopPosts"
import { cn } from "@featul/ui/lib/utils"
import {
  EMPTY_MEMBER_STATS,
  fetchMemberActivity,
  fetchMemberStats,
  fetchWorkspaceMembers,
  teamQueryKeys,
  type MemberStats,
  type MemberTopPost,
} from "@/lib/team-client"

interface Props {
  slug: string
  userId: string
  initialMembers?: Member[]
  initialMember?: Member
  initialStats?: MemberStats
  initialTopPosts?: MemberTopPost[]
  initialActivity: PaginatedActivity
}

export default function MemberDetail({ slug, userId, initialMembers, initialMember, initialStats, initialTopPosts = [], initialActivity }: Props) {
  const [mobileTab, setMobileTab] = React.useState<"activity" | "top-posts">("activity")
  const { data: members = [] } = useQuery<Member[]>({
    queryKey: teamQueryKeys.members(slug),
    queryFn: () => fetchWorkspaceMembers(slug),
    initialData: initialMembers,
    staleTime: 30_000,
    refetchOnMount: false,
  })
  const member = React.useMemo(() => {
    return initialMember || members.find((m) => m.userId === userId)
  }, [members, initialMember, userId])

  const { data: statsData, isLoading: isStatsLoading, isFetching: isStatsFetching } = useQuery({
    queryKey: teamQueryKeys.memberStats(slug, userId),
    queryFn: () => fetchMemberStats(slug, userId),
    initialData: initialStats
      ? { stats: initialStats, topPosts: initialTopPosts }
      : undefined,
    staleTime: 30_000,
    refetchOnMount: false,
  })

  const stats = statsData?.stats || initialStats || EMPTY_MEMBER_STATS
  const topPosts: MemberTopPost[] = statsData?.topPosts || initialTopPosts || []

  const {
    data: activityData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
  } = useInfiniteQuery({
    queryKey: teamQueryKeys.memberActivity(slug, userId),
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "string" && pageParam.length > 0 ? pageParam : undefined
      return fetchMemberActivity(slug, userId, cursor)
    },
    getNextPageParam: (lastPage) => (lastPage?.nextCursor ?? undefined) as string | undefined,
    initialPageParam: "",
    initialData: { pages: [initialActivity], pageParams: [""] },
    staleTime: 30_000,
    refetchOnMount: false,
  })

  const items = React.useMemo((): ActivityItem[] => {
    const pages = activityData?.pages || [initialActivity]
    return pages.flatMap((p) => p?.items || [])
  }, [activityData?.pages, initialActivity])

  const tabButtonClass = (tab: "activity" | "top-posts") =>
    cn(
      "px-3 py-1.5 text-xs rounded-sm transition-colors",
      mobileTab === tab ? "bg-muted text-foreground" : "text-accent hover:text-foreground",
    )

  return (
    <div className="rounded-sm border bg-card dark:bg-black/40 p-4 lg:p-6 space-y-4 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black">
      <MemberHeader member={member} userId={userId} stats={stats} />

      <div className="pt-4 mt-2 border-t space-y-3">
        <div className="lg:hidden inline-flex rounded-md border border-border p-1">
          <button
            type="button"
            className={tabButtonClass("activity")}
            onClick={() => setMobileTab("activity")}
          >
            Activity
          </button>
          <button
            type="button"
            className={tabButtonClass("top-posts")}
            onClick={() => setMobileTab("top-posts")}
          >
            Top posts
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.8fr)_minmax(0,1fr)] gap-4">
          <div className={cn(mobileTab === "activity" ? "block" : "hidden lg:block")}>
            <MemberActivity
              workspaceSlug={slug}
              items={items}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              isLoading={isActivityLoading || isActivityFetching}
            />
          </div>
          <div
            className={cn(
              "lg:sticky lg:top-24 lg:self-start lg:flex lg:justify-center",
              mobileTab === "top-posts" ? "block" : "hidden lg:block",
            )}
          >
            <MemberTopPosts
              slug={slug}
              topPosts={topPosts}
              isLoading={isStatsLoading || isStatsFetching}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
