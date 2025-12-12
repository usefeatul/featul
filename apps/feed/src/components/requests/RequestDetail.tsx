 "use client"

import React from "react"
import ContentImage from "@/components/global/ContentImage"
import RequestNavigation from "./RequestNavigation"
import { useRequestNavigation } from "@/hooks/useRequestNavigation"
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
  const { prevHref, nextHref } = useRequestNavigation(workspaceSlug, navigation)

  return (
    <section className="mt-4 md:mt-6">
      <div className="grid md:grid-cols-[0.7fr_0.3fr] gap-6">
        <article className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">{post.title}</h1>
            <RequestNavigation prev={navigation?.prev} next={navigation?.next} prevHref={prevHref} nextHref={nextHref} />
          </div>
          {post.content ? <div className="prose dark:prose-invert text-sm text-accent">{post.content}</div> : null}
          {post.image ? <ContentImage url={post.image} alt={post.title} className="w-48 h-36" /> : null}
          <div className="flex items-center justify-end gap-3 text-xs text-accent">
            <UpvoteButton postId={post.id} upvotes={post.upvotes} hasVoted={post.hasVoted} className="text-xs" activeBg />
            <CommentCounter postId={post.id} initialCount={post.commentCount} />
          </div>
          <div className="mt-6">
            <CommentList
              postId={post.id}
              initialCount={post.commentCount}
              workspaceSlug={workspaceSlug}
              initialComments={initialComments}
              initialCollapsedIds={initialCollapsedIds}
            />
          </div>
        </article>
        <RequestDetailSidebar post={post} workspaceSlug={workspaceSlug} readonly={readonly} />
      </div>
    </section>
  )
}

