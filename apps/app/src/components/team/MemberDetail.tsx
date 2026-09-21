"use client"

import React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import type { Member } from "@/types/team"
import type { PaginatedActivity } from "@/types/activity"
import { MemberHeader } from "@/components/team/MemberHeader"
import { MemberCounters } from "@/components/team/stats"
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
  const memberName = member?.name || member?.email || userId

  return (
    <section data-member-detail className="relative -mx-4 flex h-[calc(100dvh-5rem)] min-w-0 flex-col overflow-hidden sm:-mx-8 md:flex-row md:gap-[2px] md:bg-muted/45 md:pr-1 dark:md:bg-black/25 lg:-mx-12 lg:h-dvh xl:-mx-16">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background md:border-r md:border-border/60 dark:md:border-white/10">
        <header className="z-20 flex min-h-12 shrink-0 items-center gap-2 bg-background px-4 text-sm sm:px-6">
          <nav aria-label="Member navigation" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-2">
              <li className="shrink-0">
                <Link
                  href={`/workspaces/${slug}/members`}
                  className="rounded-md py-1 text-accent transition-colors hover:text-foreground"
                >
                  Members
                </Link>
              </li>
              <li aria-hidden className="text-accent/50">/</li>
              <li aria-current="page" className="min-w-0 truncate font-medium" title={memberName}>
                {memberName}
              </li>
            </ol>
          </nav>
        </header>

        <div data-workspace-scroll className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto flex w-full max-w-[960px] flex-col gap-8 pb-10 pt-5 sm:pt-7 lg:pt-8">
            <MemberHeader member={member} userId={userId} />

            <div className="md:hidden">
              <MemberCounters stats={stats} />
            </div>

            <div className="md:hidden">
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

            <div className={cn("min-w-0", mobileTab === "activity" ? "block" : "hidden md:block")}>
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
            <div
              className={cn(
                "min-w-0 md:hidden",
                mobileTab === "top-posts" ? "block" : "hidden",
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

      <aside aria-label="Member statistics and top posts" className="hidden h-full min-h-0 w-[22rem] shrink-0 flex-col overflow-hidden border-l border-border/60 bg-background md:flex dark:border-white/10">
        <div className="shrink-0 border-b border-border/60 p-3 dark:border-white/10">
          <MemberCounters stats={stats} />
        </div>
        <MemberTopPosts
          panel
          slug={slug}
          topPosts={topPosts}
          isLoading={isStatsLoading || isStatsFetching}
        />
      </aside>
    </section>
  )
}
