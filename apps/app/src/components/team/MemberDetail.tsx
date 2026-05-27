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
          <div className="h-full space-y-5 px-4 pb-4 pt-6 md:px-6 md:pb-5">
            <div className="rounded-lg border border-border/70 bg-card/40 p-4">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Contribution mix
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Where this member has been most active.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Requests", value: Number(stats.posts || 0) },
                  { label: "Comments", value: Number(stats.comments || 0) },
                  { label: "Votes", value: Number(stats.upvotes || 0) },
                ].map((item) => {
                  const maxValue = Math.max(
                    Number(stats.posts || 0),
                    Number(stats.comments || 0),
                    Number(stats.upvotes || 0),
                    1,
                  )
                  return (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {item.value}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{
                            width: `${Math.max(8, (item.value / maxValue) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-card/40 p-4">
              <div className="text-sm font-medium text-foreground">
                Quick read
              </div>
              <dl className="mt-4 space-y-4 text-sm">
                {[
                  {
                    label: "Primary activity",
                    value:
                      Number(stats.posts || 0) >= Number(stats.comments || 0)
                        ? "Requests"
                        : "Comments",
                  },
                  {
                    label: "Total contributions",
                    value: String(
                      Number(stats.posts || 0) + Number(stats.comments || 0),
                    ),
                  },
                  {
                    label: "Votes received",
                    value: String(Number(stats.upvotes || 0)),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="text-muted-foreground">{item.label}</dt>
                    <dd className="font-semibold text-foreground">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-lg border border-border/70 bg-card/40 p-4">
              <div className="text-sm font-medium text-foreground">
                Highlighted requests
              </div>
              {displayedPosts.length > 0 ? (
                <div className="mt-3 space-y-1">
                  {displayedPosts.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/workspaces/${slug}/requests/${post.slug}`}
                      className="block rounded-md px-2 py-2 hover:bg-card"
                    >
                      <div className="truncate text-sm font-medium text-foreground">
                        {post.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        {post.status ? (
                          <StatusIcon
                            status={String(post.status)}
                            className="size-3.5"
                          />
                        ) : null}
                        <span className="capitalize">
                          {post.status || "Pending"}
                        </span>
                        <span aria-hidden>·</span>
                        <span>{Number(post.upvotes || 0)} votes</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-md border border-dashed border-border/70 py-5 text-center text-sm text-muted-foreground">
                  No requests yet
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
