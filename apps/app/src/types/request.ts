import type { TagSummary } from "@/types/post"

export const REQUEST_FLAG_OPTIONS = [
  { key: "isPinned", label: "Pinned" },
  { key: "isLocked", label: "Locked" },
  { key: "isFeatured", label: "Featured" },
] as const

export type RequestFlagOption = (typeof REQUEST_FLAG_OPTIONS)[number]
export type RequestFlagKey = RequestFlagOption["key"]
export type RequestFlags = Partial<Record<RequestFlagKey, boolean>>

export type RequestRole = "admin" | "member" | "viewer" | null
export type ReportReason = "spam" | "harassment" | "inappropriate" | "off_topic" | "other"

export interface RequestItemData extends RequestFlags {
  id: string
  title: string
  slug: string
  content: string | null
  image: string | null
  commentCount: number
  upvotes: number
  roadmapStatus: string | null
  publishedAt: string | null
  createdAt: string
  boardSlug: string
  boardName: string
  authorImage?: string | null
  authorName?: string | null
  authorId?: string | null
  isAnonymous?: boolean
  hasVoted?: boolean
  role?: RequestRole
  isOwner?: boolean
  isFeatul?: boolean
  tags?: TagSummary[]
  reportCount?: number
}

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
  role?: RequestRole
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
  tags?: TagSummary[]
  author?: {
    name: string | null
    image: string | null
    email: string | null
  } | null
  metadata?: Record<string, unknown> | null
  reportCount?: number
}
