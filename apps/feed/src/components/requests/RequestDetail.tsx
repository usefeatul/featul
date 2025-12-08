"use client"

import React from "react"
import ContentImage from "@/components/global/ContentImage"
import StatusIcon from "./StatusIcon"
import RequestNavigation from "./RequestNavigation"
import { useRequestNavigation } from "@/hooks/useRequestNavigation"
import CommentCounter from "../comments/CommentCounter"
import StatusPicker from "./meta/StatusPicker"
import FlagsPicker from "./meta/FlagsPicker"
import BoardPicker from "./meta/BoardPicker"
import { UpvoteButton } from "../upvote/UpvoteButton"
import CommentList from "../comments/CommentList"
import type { CommentData } from "../../types/comment";


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
}

export default function RequestDetail({ post, workspaceSlug, readonly = false, initialComments, initialCollapsedIds, navigation }: { post: RequestDetailData; workspaceSlug: string; readonly?: boolean; initialComments?: CommentData[]; initialCollapsedIds?: string[]; navigation?: { prev: { slug: string; title: string } | null; next: { slug: string; title: string } | null } }) {
  const date = new Date(post.publishedAt ?? post.createdAt)
  const formatted = new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(date)
  const { prevHref, nextHref } = useRequestNavigation(workspaceSlug, navigation)
  const [meta, setMeta] = React.useState({
    roadmapStatus: post.roadmapStatus || undefined,
    isPinned: !!post.isPinned,
    isLocked: !!post.isLocked,
    isFeatured: !!post.isFeatured,
  })
  const [board, setBoard] = React.useState({ name: post.boardName, slug: post.boardSlug })
  return (
    <section className="mt-4 md:mt-6">
      <div className="grid md:grid-cols-[0.7fr_0.3fr] gap-6">
        <article className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">{post.title}</h1>
            <RequestNavigation prev={navigation?.prev} next={navigation?.next} prevHref={prevHref} nextHref={nextHref} />
          </div>
          {post.content ? <div className="prose dark:prose-invert text-sm text-accent">{post.content}</div> : null}
          {post.image ? (
            <ContentImage url={post.image} alt={post.title} className="w-48 h-36" />
          ) : null}
          <div className="flex items-center justify-end gap-3 text-xs text-accent">
            <UpvoteButton postId={post.id} upvotes={post.upvotes} hasVoted={post.hasVoted} className="text-xs" activeBg />
            <CommentCounter postId={post.id} initialCount={post.commentCount} />
          </div>
          <div className="mt-6">
            <CommentList postId={post.id} initialCount={post.commentCount} workspaceSlug={workspaceSlug} initialComments={initialComments} initialCollapsedIds={initialCollapsedIds} />
          </div>
        </article>
        <aside className="space-y-4">
          <div className="rounded-md bg-card p-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-accent">Date</span>
                <span className="text-xs text-accent">{formatted}</span>
              </div>
              {readonly ? null : (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-accent">Board</span>
                    <BoardPicker workspaceSlug={workspaceSlug} postId={post.id} value={board} onChange={setBoard} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-accent">Status</span>
                    <StatusPicker postId={post.id} value={meta.roadmapStatus} onChange={(v) => setMeta((m) => ({ ...m, roadmapStatus: v }))} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-accent">Flags</span>
                    <FlagsPicker postId={post.id} value={{ isPinned: meta.isPinned, isLocked: meta.isLocked, isFeatured: meta.isFeatured }} onChange={(v) => setMeta((m) => ({ ...m, ...v }))} />
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
