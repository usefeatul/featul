"use client"

import { useState } from "react"
import type { RequestDetailData } from "@/types/request"
import type { TagSummary } from "@/types/post"

export type RequestDetailMetaState = {
  roadmapStatus?: string
  isPinned: boolean
  isLocked: boolean
  isFeatured: boolean
}

export type RequestDetailBoardState = {
  name: string
  slug: string
}

export function useRequestDetailMeta(post: RequestDetailData) {
  const [meta, setMeta] = useState<RequestDetailMetaState>({
    roadmapStatus: post.roadmapStatus || undefined,
    isPinned: !!post.isPinned,
    isLocked: !!post.isLocked,
    isFeatured: !!post.isFeatured,
  })
  const [board, setBoard] = useState<RequestDetailBoardState>({
    name: post.boardName,
    slug: post.boardSlug,
  })
  const [tags, setTags] = useState<TagSummary[]>(post.tags || [])

  return {
    meta,
    setMeta,
    board,
    setBoard,
    tags,
    setTags,
  }
}
