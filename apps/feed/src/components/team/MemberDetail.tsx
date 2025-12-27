"use client"

import React from "react"
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import type { Member } from "@/types/team"
import { Avatar, AvatarFallback, AvatarImage } from "@oreilla/ui/components/avatar"
import { getInitials } from "@/utils/user-utils"
import { format } from "date-fns"
import { roleBadgeClass } from "@/components/settings/team/role-badge"
import { cn } from "@oreilla/ui/lib/utils"
import Link from "next/link"
import StatusIcon from "@/components/requests/StatusIcon"
import RoleBadge from "@/components/global/RoleBadge"
import { UpvoteButton } from "@/components/upvote/UpvoteButton"

interface Props {
  slug: string
  userId: string
  initialMember?: Member
  initialStats?: { posts: number; comments: number; upvotes: number }
  initialTopPosts?: Array<{ id: string; title: string; slug: string; upvotes: number; status?: string | null }>
  initialActivity: { items: any[]; nextCursor: string | null }
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm p-0">
      <div className="text-sm text-accent">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
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

  const { data: statsData } = useQuery({
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

  function renderActivityDescription(it: any) {
    const status = it.status || it.metadata?.status || it.metadata?.roadmapStatus || it.metadata?.toStatus

    if (it.entity === "post") {
      if (it.type === "post_meta_updated") {
        const fromStatus = it.metadata?.fromStatus
        const toStatus = it.metadata?.toStatus || status
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>changed status</span>
            {fromStatus && (
              <>
                <span>from</span>
                <StatusIcon status={String(fromStatus)} className="size-3.5 shrink-0" />
              </>
            )}
            {toStatus && (
              <>
                <span>to</span>
                <StatusIcon status={String(toStatus)} className="size-3.5 shrink-0" />
              </>
            )}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }

      if (it.type === "post_updated") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>updated post</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }

      if (it.type === "post_created") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>created post</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }

      if (it.type === "post_deleted") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>deleted post</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }

      if (it.type === "post_voted") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>voted for</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }

      if (it.type === "post_vote_removed") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>removed vote from</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }

      if (it.type === "post_board_updated") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>moved post</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }

      if (it.type === "post_merged") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>merged post into</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }

      if (it.type === "post_reported") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>reported post</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
    }

    if (it.entity === "comment") {
      if (it.type === "comment_created") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>added a comment on</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "comment_updated") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>updated a comment on</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "comment_deleted") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>deleted a comment on</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "comment_voted") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>voted on a comment on</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "comment_vote_removed") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>removed vote from a comment on</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "comment_reported") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>reported a comment on</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "comment_pinned") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>pinned a comment on</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "comment_unpinned") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>unpinned a comment on</span>
            {status ? <StatusIcon status={String(status)} className="size-3.5 shrink-0" /> : null}
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
    }

    if (it.entity === "changelog_entry") {
      if (it.type === "changelog_entry_created") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>created changelog entry</span>
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "changelog_entry_updated") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>updated changelog entry</span>
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "changelog_entry_deleted") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>deleted changelog entry</span>
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
      if (it.type === "changelog_entry_published") {
        return (
          <span className="flex items-center gap-2 min-w-0">
            <span>published changelog entry</span>
            {it.title ? (
              <span className="text-foreground font-medium truncate">
                {it.title}
              </span>
            ) : null}
          </span>
        )
      }
    }

    return <span>{it.type.replace("_", " ")}</span>
  }

  return (
    <div className="space-y-4">
      <div className="rounded-sm border bg-card dark:bg-black/40 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between ring-1 ring-border/60 ring-offset-1 ring-offset-background">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="size-12">
              <AvatarImage src={member?.image || ""} alt={member?.name || member?.email || ""} />
              <AvatarFallback>{getInitials(member?.name || member?.email || "")}</AvatarFallback>
            </Avatar>
            <RoleBadge role={member?.role} isOwner={member?.isOwner} />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="text-base font-semibold truncate">{member?.name || member?.email || userId}</div>
            <div className="text-xs text-accent truncate">{member?.email}</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={cn("px-2 py-0.5 rounded-full border", roleBadgeClass(member?.role || "member", member?.isOwner))}>
                {member?.isOwner ? "owner" : member?.role}
              </span>
              {member?.joinedAt ? (
                <span className="text-accent">Joined {format(new Date(member.joinedAt), "LLL d, yyyy")}</span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <StatCard label="Posts" value={Number(stats.posts || 0)} />
          <StatCard label="Comments" value={Number(stats.comments || 0)} />
          <StatCard label="Upvotes" value={Number(stats.upvotes || 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-sm bg-card dark:bg-black/40 p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">Activity</div>
          </div>
          <ul className="divide-y divide-border/50">
            {items.length === 0 ? (
              <li className="py-6 text-accent text-sm text-center">No activity yet</li>
            ) : (
              items.map((it: any) => (
                <li key={`${it.type}-${it.id}-${String(it.createdAt)}`} className="py-3">
                  <div className="text-xs text-accent flex items-center gap-2 min-w-0">
                    <span className="font-medium">
                      {format(new Date(it.createdAt), "LLL d")}
                    </span>
                    {renderActivityDescription(it)}
                  </div>
                </li>
              ))
            )}
          </ul>
          {hasNextPage ? (
            <div className="pt-3 mt-1 border-t flex justify-center">
              <button
                className="text-sm text-primary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-sm border bg-card dark:bg-black/40 p-4 ring-1 ring-border/60 ring-offset-1 ring-offset-background">
            <div className="font-semibold mb-3">Top posts</div>
            {topPosts.length === 0 ? (
              <div className="text-sm text-accent">No posts yet</div>
            ) : (
              <div className="space-y-2">
                {topPosts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted text-sm gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {p.status ? <StatusIcon status={String(p.status)} className="size-3.5 shrink-0" /> : null}
                      <Link
                        href={`/workspaces/${slug}/requests/${p.id}`}
                        className="truncate text-foreground hover:text-primary"
                      >
                        {p.title}
                      </Link>
                    </div>
                    <UpvoteButton
                      postId={p.id}
                      upvotes={Number(p.upvotes || 0)}
                      className="text-xs"
                      activeBg
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
