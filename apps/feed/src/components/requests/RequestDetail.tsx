"use client"

import React from "react"
import StatusIcon from "./StatusIcon"
import { LoveIcon } from "@feedgot/ui/icons/love"
import { CommentsIcon } from "@feedgot/ui/icons/comments"

export type RequestDetailData = {
  id: string
  title: string
  content: string | null
  image: string | null
  upvotes: number
  commentCount: number
  roadmapStatus: string | null
  priority?: string | null
  effort?: string | null
  isFeatured?: boolean
  isLocked?: boolean
  isPinned?: boolean
  publishedAt: string | null
  createdAt: string
  boardName: string
  boardSlug: string
}

export default function RequestDetail({ post }: { post: RequestDetailData }) {
  const date = new Date(post.publishedAt ?? post.createdAt)
  const formatted = new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(date)
  return (
    <section className="mt-4 md:mt-6">
      <div className="grid md:grid-cols-[0.7fr_0.3fr] gap-6">
        <article className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">{post.title}</h1>
            <div className="flex items-center gap-3 text-xs text-accent">
              <span className="inline-flex items-center gap-1.5">
                <LoveIcon aria-hidden className="w-4 h-4" />
                <span className="tabular-nums">{post.upvotes}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CommentsIcon aria-hidden className="w-4 h-4" />
                <span className="tabular-nums">{post.commentCount}</span>
              </span>
            </div>
          </div>
          {post.image ? (
            <img src={post.image} alt="" className="w-48 h-36 rounded-md object-cover border" />
          ) : null}
          {post.content ? <div className="prose dark:prose-invert text-sm">{post.content}</div> : null}
          <div className="rounded-md border bg-card p-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Comments</h2>
              <span className="text-xs text-accent">{post.commentCount}</span>
            </div>
            <div className="mt-2 text-xs text-accent">No comments yet.</div>
          </div>
        </article>
        <aside className="space-y-4">
          <div className="rounded-md border bg-card p-3">
            <div className="flex items-center gap-2">
              <StatusIcon status={post.roadmapStatus || undefined} className="w-[20px] h-[20px] text-foreground/80" />
              <span className="text-xs text-accent">{post.boardName}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs text-accent">
              <span className="rounded-md bg-muted px-2 py-0.5">{post.roadmapStatus || "pending"}</span>
              <span>{formatted}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-accent">
              {post.priority ? <span className="rounded-md bg-muted px-2 py-0.5">{post.priority}</span> : null}
              {post.effort ? <span className="rounded-md bg-muted px-2 py-0.5">{post.effort}</span> : null}
              {post.isPinned ? <span className="rounded-md bg-muted px-2 py-0.5">pinned</span> : null}
              {post.isLocked ? <span className="rounded-md bg-muted px-2 py-0.5">locked</span> : null}
              {post.isFeatured ? <span className="rounded-md bg-muted px-2 py-0.5">featured</span> : null}
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
