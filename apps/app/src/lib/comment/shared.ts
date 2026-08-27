import type { CommentData } from "@/types/comment"

/** Workspace app vs public subdomain comment APIs. */
export type CommentSurface = "workspace" | "public"

export interface CommentListResponse {
  comments: CommentData[]
}

export type CommentCreatedEventDetail = {
  postId: string
  parentId?: string | null
  surface: CommentSurface
}

export type CommentDeletedEventDetail = {
  postId: string
  surface: CommentSurface
}

/** Cross-tree event names for comment list invalidation. */
export const COMMENT_CREATED_EVENT = "comment:created"
export const COMMENT_DELETED_EVENT = "comment:deleted"

/** React Query key scoped by post and comment surface. */
export function getCommentsQueryKey(
  postId: string,
  surface: CommentSurface
): readonly ["comments", string, CommentSurface] {
  return ["comments", postId, surface]
}

/** Coerces unknown API payloads into a comments array. */
export function toCommentListResponse(data: unknown): CommentListResponse {
  if (!data || typeof data !== "object") {
    return { comments: [] }
  }

  const maybeComments = (data as { comments?: unknown }).comments
  if (!Array.isArray(maybeComments)) {
    return { comments: [] }
  }

  return { comments: maybeComments as CommentData[] }
}
