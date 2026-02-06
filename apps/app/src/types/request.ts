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
