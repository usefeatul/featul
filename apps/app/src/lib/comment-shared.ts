import type { CommentData } from "@/types/comment"

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

export const COMMENT_CREATED_EVENT = "comment:created"
export const COMMENT_DELETED_EVENT = "comment:deleted"

export function getCommentsQueryKey(
  postId: string,
  surface: CommentSurface
): readonly ["comments", string, CommentSurface] {
  return ["comments", postId, surface]
}

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
