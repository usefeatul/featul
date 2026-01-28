"use client"

import { useState } from "react"
import Link from "next/link"
import ContentImage from "@/components/global/ContentImage"
import RequestNavigation from "./RequestNavigation"
import { useRequestNavigation } from "@/hooks/useRequestNavigation"
import { buildRequestsUrl } from "@/utils/request-filters"
import CommentCounter from "../comments/CommentCounter"
import { UpvoteButton } from "../upvote/UpvoteButton"
import CommentList from "../comments/CommentList"
import RequestDetailSidebar from "./RequestDetailSidebar"
import type { CommentData } from "../../types/comment"
import { Button } from "@featul/ui/components/button"
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right"
import { EditIcon } from "@featul/ui/icons/edit"
import { MergePopover } from "./MergePopover"
import { DeletePostButton } from "./DeletePostButton"
import { useIsMobile } from "@featul/ui/hooks/use-mobile"
import EditPostModal from "../subdomain/request-detail/EditPostModal"

export type RequestDetailData = {
  id: string
  title: string
  content: string | null
  image: string | null
  upvotes: number
  commentCount: number
  roadmapStatus: string | null
  isFeatured?: boolean
  isLocked?: boolean
  isPinned?: boolean
  publishedAt: string | null
  createdAt: string
  boardName: string
  boardSlug: string
  hasVoted?: boolean
  role?: "admin" | "member" | "viewer" | null
  isOwner?: boolean
  isFeatul?: boolean
  duplicateOfId?: string | null
  mergedInto?: {
    id: string
    slug: string
    title: string
    roadmapStatus?: string | null
    mergedAt?: string | null
    boardName?: string
    boardSlug?: string
  } | null
  mergedCount?: number
  mergedSources?: Array<{
    id: string
    slug: string
    title: string
    roadmapStatus?: string | null
    mergedAt?: string | null
    boardName?: string
    boardSlug?: string
  }>
  tags?: Array<{
    id: string
    name: string
    slug: string
    color?: string | null
  }>
  author?:
  | {
    name: string | null
    image: string | null
    email: string | null
  }
  | null
  metadata?: Record<string, unknown> | null
  reportCount?: number
}

export default function RequestDetail({
  post,
  workspaceSlug,
  readonly = false,
  initialComments,
  initialCollapsedIds,
  navigation,
}: {
  post: RequestDetailData
  workspaceSlug: string
  readonly?: boolean
  initialComments?: CommentData[]
  initialCollapsedIds?: string[]
  navigation?: { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null }
}) {
  const { prevHref, nextHref, searchParams } = useRequestNavigation(workspaceSlug, navigation)
  const backHref = buildRequestsUrl(workspaceSlug, searchParams, {})
  const isMobile = useIsMobile()
  const [editOpen, setEditOpen] = useState(false)
  const canEdit = (post.role === "admin" || post.isOwner) && !readonly

  return (
    <section>
      <div className="overflow-hidden rounded-sm ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-card dark:bg-black/40 border border-border">
        <div className="grid items-stretch gap-0 md:grid-cols-[0.7fr_0.3fr]">
          <article className="relative min-w-0 px-4 py-4 md:px-6 md:py-5">
            <div aria-hidden className="absolute right-0 top-0 hidden h-full w-px bg-border/50 md:block" />
            <header className="pb-4">
              {isMobile ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Button asChild variant="nav" size="xs">
                      <Link href={backHref} aria-label="Back to requests">
                        <ChevronLeftIcon className="size-3" />
                      </Link>
                    </Button>
                    <div className="inline-flex items-center gap-2">
                      <Toolbar size="sm" variant="plain">
                        <MergePopover postId={post.id} workspaceSlug={workspaceSlug} />
                        <ToolbarSeparator />
                        <DeletePostButton postId={post.id} workspaceSlug={workspaceSlug} backHref={backHref} />
                      </Toolbar>
                    </div>
                  </div>
                  <h1 className="text-lg font-semibold leading-tight wrap-break-words text-foreground">
                    {post.title}
                  </h1>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <h1 className="text-lg font-semibold leading-snug wrap-break-words text-foreground md:text-xl">
                        {post.title}
                      </h1>
                    </div>
                    <RequestNavigation
                      postId={post.id}
                      workspaceSlug={workspaceSlug}
                      prev={navigation?.prev}
                      next={navigation?.next}
                      prevHref={prevHref}
                      nextHref={nextHref}
                      backHref={backHref}
                      className="shrink-0"
                      showActions
                    />
                  </div>
                </div>
              )}
            </header>

            <div className="space-y-5 pt-4 relative group">
              {canEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={
                    isMobile
                      ? "absolute right-0 -top-1 h-7 w-7 p-0"
                      : "absolute right-0 -top-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                  }
                  onClick={() => setEditOpen(true)}
                  aria-label="Edit post"
                >
                  <EditIcon className="h-3 w-3 text-accent" />
                </Button>
              ) : null}
              {post.content ? (
                <div className="prose text-sm text-accent dark:prose-invert break-all md:wrap-break-words whitespace-normal min-w-0">
                  {post.content}
                </div>
              ) : null}
              {post.image ? (
                <div className="flex justify-start">
                  <ContentImage url={post.image} alt={post.title} className="h-40 w-auto max-w-full rounded-md" />
                </div>
              ) : null}
              {isMobile ? (
                <div className="flex items-center justify-between gap-3 text-sm text-accent">
                  <div className="inline-flex items-center gap-3">
                    <UpvoteButton postId={post.id} upvotes={post.upvotes} hasVoted={post.hasVoted} className="text-sm" />
                    <CommentCounter postId={post.id} initialCount={post.commentCount} />
                  </div>
                  <Toolbar size="sm" variant="plain">
                    <Button
                      asChild
                      variant="nav"
                      size="sm"
                      className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card"
                      disabled={!prevHref}
                    >
                      {prevHref ? (
                        <Link href={prevHref} aria-label="Previous post">
                          <ChevronLeftIcon className="size-3" />
                          <span className="text-xs font-medium">Prev</span>
                        </Link>
                      ) : (
                        <span aria-hidden="true" className="flex items-center gap-2">
                          <ChevronLeftIcon className="size-3.5 opacity-50" />
                          <span className="text-xs font-medium opacity-50">Prev</span>
                        </span>
                      )}
                    </Button>
                    <ToolbarSeparator />
                    <Button
                      asChild
                      variant="nav"
                      size="sm"
                      className="h-8 px-3 gap-2 rounded-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-card"
                      disabled={!nextHref}
                    >
                      {nextHref ? (
                        <Link href={nextHref} aria-label="Next post">
                          <span className="text-xs font-medium">Next</span>
                          <ChevronRightIcon className="size-3" />
                        </Link>
                      ) : (
                        <span aria-hidden="true" className="flex items-center gap-2">
                          <span className="text-xs font-medium opacity-50">Next</span>
                          <ChevronRightIcon className="size-3.5 opacity-50" />
                        </span>
                      )}
                    </Button>
                  </Toolbar>
                </div>
              ) : null}
              {isMobile ? null : (
                <div className="flex items-center justify-end gap-3 text-xs text-accent">
                  <UpvoteButton postId={post.id} upvotes={post.upvotes} hasVoted={post.hasVoted} className="text-xs" />
                  <CommentCounter postId={post.id} initialCount={post.commentCount} />
                </div>
              )}
              <div className="mt-2 pt-4">
                <CommentList
                  postId={post.id}
                  initialCount={post.commentCount}
                  workspaceSlug={workspaceSlug}
                  initialComments={initialComments}
                  initialCollapsedIds={initialCollapsedIds}
                />
              </div>
            </div>
          </article>

          <RequestDetailSidebar post={post} workspaceSlug={workspaceSlug} readonly={readonly} />
        </div>
      </div>
      {canEdit ? (
        <EditPostModal open={editOpen} onOpenChange={setEditOpen} workspaceSlug={workspaceSlug} post={post} />
      ) : null}
    </section>
  )
}
