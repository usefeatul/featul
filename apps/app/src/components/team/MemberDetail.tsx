"use client"

import React from "react"
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import type { Member } from "@/types/team"
import { MemberHeader } from "@/components/team/MemberHeader"
import { MemberActivity } from "@/components/team/MemberActivity"
import { MemberTopPosts } from "@/components/team/MemberTopPosts"

interface Props {
  slug: string
  userId: string
  initialMember?: Member
  initialStats?: { posts: number; comments: number; upvotes: number }
  initialTopPosts?: Array<{ id: string; title: string; slug: string; upvotes: number; status?: string | null }>
  initialActivity: { items: any[]; nextCursor: string | null }
}

export default function MemberDetail({ slug, userId, initialMember, initialStats, initialTopPosts = [], initialActivity }: Props) {
  const { data: membersData } = useQuery({
    queryKey: ["members", slug],
    queryFn: async () => {
      const res = await client.team.membersByWorkspaceSlug.$get({ slug })
      const d = await res.json()
      return { members: (d?.members || []) as Member[] }
    },
    staleTime: 30_000,
  })
  const member = React.useMemo(() => {
    const list = membersData?.members || []
    return initialMember || list.find((m) => m.userId === userId)
  }, [membersData?.members, initialMember, userId])

  const { data: statsData, isLoading: isStatsLoading, isFetching: isStatsFetching } = useQuery({
    queryKey: ["member-stats", slug, userId],
    queryFn: async () => {
      const res = await client.member.statsByWorkspaceSlug.$get({ slug, userId })
      const d = await res.json() as { stats?: { posts: number; comments: number; upvotes: number }; topPosts?: any[] }
      return {
        stats: d?.stats || { posts: 0, comments: 0, upvotes: 0 },
        topPosts: (d?.topPosts || []) as Array<{ id: string; title: string; slug: string; upvotes: number; status?: string | null }>,
      }
    },
    placeholderData: { stats: initialStats || { posts: 0, comments: 0, upvotes: 0 }, topPosts: initialTopPosts },
    staleTime: 30_000,
    refetchOnMount: false,
  })

  const stats = statsData?.stats || initialStats || { posts: 0, comments: 0, upvotes: 0 }
  const topPosts = (statsData?.topPosts || initialTopPosts || []) as Array<{
    id: string
    title: string
    slug: string
    upvotes: number
    status?: string | null
  }>

  const {
    data: activityData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
  } = useInfiniteQuery({
    queryKey: ["member-activity", slug, userId],
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "string" && pageParam.length > 0 ? pageParam : undefined
      const res = await client.member.activityByWorkspaceSlug.$get({ slug, userId, limit: 20, cursor })
      const d = await res.json() as { items?: any[]; nextCursor?: string | null }
      return d
    },
    getNextPageParam: (lastPage) => (lastPage?.nextCursor ?? undefined) as string | undefined,
    initialPageParam: "",
    placeholderData: { pages: [initialActivity], pageParams: [""] } as any,
    staleTime: 30_000,
    refetchOnMount: false,
  })

  const items = React.useMemo(() => {
    const pages = (activityData?.pages as any[]) || [initialActivity]
    return pages.flatMap((p: any) => p?.items || [])
  }, [activityData?.pages, initialActivity])

  return (
    <div className="rounded-sm border bg-card dark:bg-black/40 p-4 lg:p-6 space-y-4 ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black">
      <MemberHeader member={member} userId={userId} stats={stats} />

      <div className="pt-4 mt-2 border-t grid grid-cols-1 lg:grid-cols-3 gap-4">
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
