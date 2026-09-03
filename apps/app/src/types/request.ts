import type { TagSummary } from "@/types/post"
import type { OnboardingPostKind } from "@/lib/onboarding/post"

/** Moderator flags that can be set independently on a request. */
export const REQUEST_FLAG_OPTIONS = [
  { key: "isPinned", label: "Pinned" },
  { key: "isLocked", label: "Locked" },
  { key: "isFeatured", label: "Featured" },
] as const

export type RequestFlagOption = (typeof REQUEST_FLAG_OPTIONS)[number]
export type RequestFlagKey = RequestFlagOption["key"]
export type RequestFlags = Partial<Record<RequestFlagKey, boolean>>

/** Author membership on the request; null when not a workspace member. */
export type RequestRole = "admin" | "member" | "viewer" | null
/** Allowed reasons when reporting a post. */
export type ReportReason = "spam" | "harassment" | "inappropriate" | "off_topic" | "other"
export type ReportReasonOption = {
  value: ReportReason
  label: string
  hint: string
  placeholder: string
}
export const REPORT_REASONS: ReportReasonOption[] = [
  {
    value: "spam",
    label: "Spam",
    hint: "Ads, scams, or repetitive promotions.",
    placeholder: "Share any links or details that look spammy.",
  },
  {
    value: "harassment",
    label: "Harassment",
    hint: "Bullying, threats, or targeted abuse.",
    placeholder: "Explain who was targeted and what happened.",
  },
  {
    value: "inappropriate",
    label: "Inappropriate content",
    hint: "Graphic, explicit, or unsafe material.",
    placeholder: "Tell us what part of the post is inappropriate.",
  },
  {
    value: "off_topic",
    label: "Off topic",
    hint: "Doesn't belong in this workspace or board.",
    placeholder: "Describe why this post is not relevant here.",
  },
  {
    value: "other",
    label: "Other",
    hint: "Something else not listed above.",
    placeholder: "Add any context that helps us review quickly.",
  },
]

/** Dashboard request list row (flags, onboarding, optional report count). */
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
  updatedAt?: string | null
  snoozedUntil?: string | null
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
  isOnboarding?: boolean
  onboardingKind?: OnboardingPostKind | null
  tags?: TagSummary[]
  reportCount?: number
}

/** Merged request shown in detail hover cards. */
export type MergedRequestSummary = {
  id: string
  slug: string
  title: string
  content?: string | null
  upvotes?: number
  commentCount?: number
  roadmapStatus?: string | null
  mergedAt?: string | null
  publishedAt?: string | null
  createdAt?: string | null
  boardName?: string
  boardSlug?: string
  authorId?: string | null
  authorName?: string | null
  authorImage?: string | null
}

/** Full request including merge graph, author, and lock/pin flags. */
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
  allowComments?: boolean
  hasVoted?: boolean
  role?: RequestRole
  isOwner?: boolean
  isFeatul?: boolean
  isOnboarding?: boolean
  duplicateOfId?: string | null
  mergedInto?: MergedRequestSummary | null
  mergedCount?: number
  mergedSources?: MergedRequestSummary[]
  tags?: TagSummary[]
  author?: {
    name: string | null
    image: string | null
    email: string | null
  } | null
  metadata?: Record<string, unknown> | null
  reportCount?: number
}
