"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import type { Member } from "@/types/team"
import type { PaginatedActivity } from "@/types/activity"
import { MemberHeader } from "@/components/team/MemberHeader"
import { MemberActivity } from "@/components/team/MemberActivity"
import { MemberTopPosts } from "@/components/team/MemberTopPosts"
import { useMemberActivityQuery } from "@/components/team/useMemberActivityQuery"
import { cn } from "@featul/ui/lib/utils"
import { teamQueryKeys } from "@/lib/team/keys"
import {
  EMPTY_MEMBER_STATS,
  fetchMemberStats,
  fetchWorkspaceMembers,
} from "@/lib/team/client"
import type { MemberStats, MemberTopPost } from "@/lib/team"
import { Button } from "@featul/ui/components/button"
import { Toolbar, ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar"

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
    items,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isActivityLoading,
    isFetching: isActivityFetching,
  } = useMemberActivityQuery({
    slug,
    userId,
    initialActivity,
  })

  const tabClass = (tab: "activity" | "top-posts") =>
    cn(
      toolbarItemClass,
      "h-8 flex-1 px-3 text-xs",
      mobileTab === tab ? "text-foreground" : "text-accent",
    )

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[0.7fr_0.3fr]">
      <div className="flex min-w-0 flex-col gap-4">
        <MemberHeader member={member} userId={userId} stats={stats} />

        <div className="lg:hidden">
          <Toolbar size="sm">
            <Button
              type="button"
              variant="plain"
              className={tabClass("activity")}
              onClick={() => setMobileTab("activity")}
            >
              Activity
            </Button>
            <ToolbarSeparator />
            <Button
              type="button"
              variant="plain"
              className={tabClass("top-posts")}
              onClick={() => setMobileTab("top-posts")}
            >
              Top posts
            </Button>
          </Toolbar>
        </div>

        <div className={cn(mobileTab === "activity" ? "block" : "hidden lg:block")}>
          <MemberActivity
            workspaceSlug={slug}
            items={items}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            isLoading={isActivityLoading || isActivityFetching}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>
      </div>

      <div className={cn(mobileTab === "top-posts" ? "block" : "hidden lg:block")}>
        <MemberTopPosts
          slug={slug}
          topPosts={topPosts}
          isLoading={isStatsLoading || isStatsFetching}
        />
      </div>
    </div>
  )
}
