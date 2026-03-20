import type { ActivityCategory } from "@featul/api/shared/member-activity"
import type { Role } from "@/types/team"

export type MemberActivityCategory = ActivityCategory

export type WorkspaceViewer = {
  role: Role | null
  isOwner: boolean
}

export type MemberStats = {
  posts: number
  comments: number
  upvotes: number
}

export type MemberTopPost = {
  id: string
  title: string
  slug: string
  upvotes: number
  status?: string | null
}

export const EMPTY_MEMBER_STATS: MemberStats = {
  posts: 0,
  comments: 0,
  upvotes: 0,
}
