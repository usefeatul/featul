import { useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { client } from "@featul/api/client"
import type { UploadedImage } from "@/hooks/useImageUpload"
import { getBrowserFingerprint } from "@/utils/fingerprint"
import type { CommentData } from "../types/comment"
import { readApiErrorMessage } from "@/hooks/postApiError"
import {
  COMMENT_CREATED_EVENT,
  getCommentsQueryKey,
  type CommentCreatedEventDetail,
  type CommentSurface,
} from "@/lib/comment-shared"

interface UseCommentSubmitProps {
  postId: string
  parentId?: string
  surface: CommentSurface
  onSuccess?: () => void
  resetForm: () => void
}

interface CreateCommentResponse {
  comment?: Partial<CommentData>;
  message?: string;
  error?: { message?: string };
}

export function useCommentSubmit({
  postId,
  parentId,
  surface,
  onSuccess,
  resetForm,
}: UseCommentSubmitProps) {
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  const handleSubmit = async (
    e: React.FormEvent,
    content: string,
    uploadedImage: UploadedImage | null,
    isInternal: boolean
  ) => {
    e.preventDefault()
    if ((!content.trim() && !uploadedImage) || isPending) return

    startTransition(async () => {
      try {
        const fingerprint = await getBrowserFingerprint()

        const metadata = uploadedImage
          ? {
            attachments: [
              {
                name: uploadedImage.name,
                url: uploadedImage.url,
                type: uploadedImage.type,
              },
            ],
          }
          : undefined

        const res = await client.comment.create.$post({
          postId,
          content: content.trim() || "",
          ...(parentId ? { parentId } : {}),
          isInternal,
          ...(metadata ? { metadata } : {}),
          fingerprint,
        })

        if (res.ok) {
          let createdComment: Partial<CommentData> | null = null
          try {
            const data = await res.json() as CreateCommentResponse
            createdComment = data?.comment || null
          } catch {
            // ignore
          }

          if (createdComment) {
            try {
              const mapped: CommentData = {
                id: String(createdComment.id),
                postId: String(createdComment.postId || postId),
                parentId: createdComment.parentId || null,
                content: createdComment.content || "",
                authorId: createdComment.authorId ?? null,
                authorName: createdComment.authorName || "Anonymous",
                authorEmail: createdComment.authorEmail ?? null,
                authorImage: "",
                isAnonymous: createdComment.isAnonymous ?? null,
                status: createdComment.status || "published",
                upvotes:
                  typeof createdComment.upvotes === "number"
                    ? createdComment.upvotes
                    : 1,
                downvotes:
                  typeof createdComment.downvotes === "number"
                    ? createdComment.downvotes
                    : 0,
                replyCount:
                  typeof createdComment.replyCount === "number"
                    ? createdComment.replyCount
                    : 0,
                depth:
                  typeof createdComment.depth === "number"
                    ? createdComment.depth
                    : 0,
                isPinned: createdComment.isPinned ?? null,
                isInternal: createdComment.isInternal ?? false,
                isEdited: createdComment.isEdited ?? null,
                createdAt:
                  createdComment.createdAt ||
                  new Date().toISOString(),
                updatedAt:
                  createdComment.updatedAt ||
                  createdComment.createdAt ||
                  new Date().toISOString(),
                editedAt: createdComment.editedAt ?? null,
                userVote: createdComment.userVote === "upvote" ? "upvote" : null,
                role: null,
                isOwner: false,
                metadata: createdComment.metadata ?? null,
              }

              queryClient.setQueryData<{ comments: CommentData[] }>(
                getCommentsQueryKey(postId, surface),
                (prev) => {
                  const base = prev?.comments || []
                  const exists = base.some(
                    (c) => c.id === mapped.id
                  )
                  if (exists) return prev || { comments: base }
                  return {
                    ...(prev || {}),
                    comments: [mapped, ...base],
                  }
                }
              )
            } catch (e) {
              console.error("Failed to update cache:", e)
            }
          }

          resetForm()
          toast.success(parentId ? "Reply posted" : "Comment posted")
          try {
            const detail: CommentCreatedEventDetail = {
              postId,
              parentId: parentId || null,
              surface,
            }
            window.dispatchEvent(
              new CustomEvent<CommentCreatedEventDetail>(COMMENT_CREATED_EVENT, {
                detail,
              })
            )
          } catch (e) {
            console.error("Failed to dispatch event:", e)
          }

          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch (e) {
            console.error("Failed to invalidate queries:", e)
          }

          onSuccess?.()
        } else if (res.status === 401) {
          toast.error("Please sign in to comment")
        } else if (res.status === 403) {
          const message = await readApiErrorMessage(
            res,
            "Comments are currently disabled on this board"
          )
          toast.error(message)
        } else {
          const message = await readApiErrorMessage(res, "Failed to post comment")
          toast.error(message)
        }
      } catch (error) {
        console.error("Failed to post comment:", error)
        toast.error("Failed to post comment")
      }
    })
  }

  return {
    isPending,
    handleSubmit,
  }
}
