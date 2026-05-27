"use client"

import React from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import type { Member } from "@/types/team"
import type { PaginatedActivity } from "@/types/activity"
import { MemberHeader } from "@/components/team/MemberHeader"
import { MemberActivity } from "@/components/team/MemberActivity"
import { useMemberActivityQuery } from "@/components/team/useMemberActivityQuery"
import StatusIcon from "@/components/requests/StatusIcon"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"
import { cn } from "@featul/ui/lib/utils"
import { teamQueryKeys } from "@/lib/team-query-keys"
import {
  EMPTY_MEMBER_STATS,
  fetchMemberStats,
  fetchWorkspaceMembers,
} from "@/lib/team-client"
import type { MemberStats, MemberTopPost } from "@/lib/team"

interface Props {
  slug: string
  userId: string
  initialMembers?: Member[]
  initialMember?: Member
  initialStats?: MemberStats
  initialTopPosts?: MemberTopPost[]
  initialActivity: PaginatedActivity
}

export default function MemberDetail({
  slug,
  userId,
  initialMembers,
  initialMember,
  initialStats,
  initialTopPosts = [],
  initialActivity,
}: Props) {
  const [activeTab, setActiveTab] = React.useState<"requests" | "activity">(
    "requests",
  )
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

  const { data: statsData } = useQuery({
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

  const displayedPosts = topPosts.slice(0, 8)

  const tabButtonClass = (tab: "requests" | "activity") =>
    cn(
      "border-b-2 px-0 pb-3 text-base font-medium transition-colors",
      activeTab === tab
        ? "border-foreground text-foreground"
        : "border-transparent text-accent hover:text-foreground",
    )

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[var(--workspace-surface)]">
      <div className="grid min-h-full flex-1 items-stretch gap-0 md:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="relative min-w-0 px-4 pb-4 pt-14 md:px-6 md:pb-5 md:pt-24">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-9">
              <MemberHeader member={member} userId={userId} stats={stats} />
            </div>

            <div className="mb-5 flex items-center gap-5 border-b border-border/70">
              <button
                type="button"
                className={tabButtonClass("requests")}
                onClick={() => setActiveTab("requests")}
              >
                Requests
              </button>
              <button
                type="button"
                className={tabButtonClass("activity")}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
            </div>

            {activeTab === "requests" ? (
              displayedPosts.length > 0 ? (
                <ul className="m-0 list-none divide-y divide-border/60 p-0">
                  {displayedPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/workspaces/${slug}/requests/${post.slug}`}
                        className="grid min-h-[5.5rem] grid-cols-[minmax(0,1fr)_auto] gap-4 py-5 transition-colors hover:bg-card/60 sm:px-1"
                      >
                        <div className="min-w-0 space-y-2">
                          <div className="text-sm text-accent">Requests</div>
                          <h2 className="truncate text-base font-semibold text-foreground">
                            {post.title}
                          </h2>
                          <div className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 bg-card px-2.5 text-sm text-muted-foreground">
                            {post.status ? (
                              <StatusIcon
                                status={String(post.status)}
                                className="size-3.5"
                              />
                            ) : null}
                            <span className="capitalize">
                              {post.status || "Pending"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-3 text-sm text-muted-foreground">
                          <span>Top post</span>
                          <UpvoteButton
                            postId={post.id}
                            upvotes={Number(post.upvotes || 0)}
                            className="h-7 rounded-md border border-border/70 bg-card px-2.5 text-sm"
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-10 text-center text-sm text-accent">
                  No requests yet
                </div>
              )
            ) : (
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
            )}
          </div>
        </article>

        <aside className="hidden self-stretch border-l border-border md:block">
          <div className="h-full space-y-4 px-4 pb-4 pt-6 md:px-6 md:pb-5">
            <div className="rounded-lg border border-border/70 bg-card/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Activity</span>
                <span className="text-muted-foreground">Member</span>
              </div>
              <div className="mt-4 grid grid-cols-8 gap-1">
                {Array.from({ length: 32 }).map((_, index) => {
                  const activeCount =
                    Number(stats.posts || 0) + Number(stats.comments || 0)
                  const isActive = index < Math.min(activeCount, 32)
                  return (
                    <span
                      key={index}
                      className={cn(
                        "aspect-square rounded-sm",
                        isActive ? "bg-primary/70" : "bg-muted",
                      )}
                      aria-hidden="true"
                    />
                  )
                })}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {Number(stats.posts || 0) + Number(stats.comments || 0)}{" "}
                contributions tracked
              </p>
            </div>

            <div className="rounded-lg border border-border/70 bg-card/40 p-4">
              <div className="text-sm font-medium text-foreground">Impact</div>
              <dl className="mt-4 space-y-3 text-base">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Requests created</dt>
                  <dd className="font-semibold tabular-nums">
                    {Number(stats.posts || 0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Comments posted</dt>
                  <dd className="font-semibold tabular-nums">
                    {Number(stats.comments || 0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Votes received</dt>
                  <dd className="font-semibold tabular-nums">
                    {Number(stats.upvotes || 0)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
