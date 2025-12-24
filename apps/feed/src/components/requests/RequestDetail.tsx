"use client"

import ContentImage from "@/components/global/ContentImage"
import RequestNavigation from "./RequestNavigation"
import { useRequestNavigation } from "@/hooks/useRequestNavigation"
import { buildRequestsUrl } from "@/utils/request-filters"
import CommentCounter from "../comments/CommentCounter"
import { UpvoteButton } from "../upvote/UpvoteButton"
import CommentList from "../comments/CommentList"
import RequestDetailSidebar from "./RequestDetailSidebar"
import type { CommentData } from "../../types/comment"

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
  metadata?: Record<string, any> | null
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

  return (
    <section className="">
      <div className="overflow-hidden rounded-sm bg-card dark:bg-black/40 border border-border">
        <div className="grid items-stretch gap-0 md:grid-cols-[0.7fr_0.3fr]">
          <article className="relative  px-4 py-4 md:px-6 md:py-5">
            <div aria-hidden className="absolute right-0 top-0 hidden h-full w-px bg-border/50 md:block" />
            <header className="pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-lg font-semibold leading-snug text-foreground md:text-xl">{post.title}</h1>
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
            </header>

            <div className="space-y-5 pt-4">
              {post.content ? <div className="prose text-sm text-accent dark:prose-invert">{post.content}</div> : null}
              {post.image ? (
                <div className="flex justify-start">
                  <ContentImage url={post.image} alt={post.title} className="h-40 w-auto max-w-full rounded-md" />
                </div>
              ) : null}
              <div className="flex items-center justify-end gap-3 text-xs text-accent">
                <UpvoteButton postId={post.id} upvotes={post.upvotes} hasVoted={post.hasVoted} className="text-xs" activeBg />
                <CommentCounter postId={post.id} initialCount={post.commentCount} />
              </div>
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
    </section>
  )
}
