"use client"

import React from "react"
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import type { Member } from "@/types/team"
import type { ActivityItem, PaginatedActivity } from "@/types/activity"
import { MemberHeader } from "@/components/team/MemberHeader"
import { MemberActivity } from "@/components/team/MemberActivity"
import { MemberTopPosts } from "@/components/team/MemberTopPosts"
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

  return (
    <div className="rounded-sm border bg-card dark:bg-black/40 p-4 lg:p-6 space-y-4 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black">
      <MemberHeader member={member} userId={userId} stats={stats} />

      <div className="pt-4 mt-2 border-t grid grid-cols-1 lg:grid-cols-[minmax(0,2.8fr)_minmax(0,1fr)] gap-4">
        <MemberActivity
          items={items}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          isLoading={isActivityLoading || isActivityFetching}
        />
        <MemberTopPosts
          slug={slug}
          topPosts={topPosts}
          isLoading={isStatsLoading || isStatsFetching}
        />
      </div>
    </div>
  )
}
