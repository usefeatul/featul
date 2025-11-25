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
  publishedAt: string | null
  createdAt: string
  boardName: string
  boardSlug: string
}

export default function RequestDetail({ post }: { post: RequestDetailData }) {
  const date = new Date(post.publishedAt ?? post.createdAt)
  const formatted = new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(date)
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <StatusIcon status={post.roadmapStatus || undefined} className="w-[20px] h-[20px] text-foreground/80" />
        <h1 className="text-xl font-semibold">{post.title}</h1>
      </div>
      {post.image ? <img src={post.image} alt="" className="w-full max-w-xl rounded-md object-cover border" /> : null}
      <div className="text-sm text-accent">{post.boardName}</div>
      <div className="mt-2 flex items-center gap-3 text-xs text-accent">
        <span className="rounded-md bg-muted px-2 py-0.5">{post.roadmapStatus || "pending"}</span>
        <span className="inline-flex items-center gap-1.5">
          <LoveIcon aria-hidden className="w-4 h-4" />
          <span className="tabular-nums">{post.upvotes}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CommentsIcon aria-hidden className="w-4 h-4" />
          <span className="tabular-nums">{post.commentCount}</span>
        </span>
        <span>{formatted}</span>
      </div>
      {post.content ? <div className="prose dark:prose-invert text-sm">{post.content}</div> : null}
    </section>
  )
}

