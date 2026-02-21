export type CommentData = {
  id: string
  postId: string
  parentId: string | null
  content: string
  authorId: string | null
  authorName: string
  authorEmail: string | null
  authorImage: string
  isAnonymous: boolean | null
  status: string
  upvotes: number
  downvotes: number
  replyCount: number
  depth: number
  isPinned: boolean | null
  isInternal: boolean
  isEdited: boolean | null
  createdAt: string
  updatedAt: string
  editedAt: string | null
  userVote?: "upvote" | "downvote" | null
  role?: "admin" | "member" | "viewer" | null
  isOwner?: boolean
  metadata?: {
    attachments?: { name: string; url: string; type: string }[]
    mentions?: string[]
    editHistory?: { content: string; editedAt: string }[]
  } | null
  reportCount?: number
}
