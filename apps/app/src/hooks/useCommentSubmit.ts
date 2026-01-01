import { useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { client } from "@featul/api/client"
import  { UploadedImage } from "@/hooks/useImageUpload"
import { getBrowserFingerprint } from "@/utils/fingerprint"
import type { CommentData } from "../types/comment"

interface UseCommentSubmitProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  resetForm: () => void
}

export function useCommentSubmit({
  postId,
  parentId,
  onSuccess,
  resetForm,
}: UseCommentSubmitProps) {
  const [isPending, startTransition] = useTransition()
  const queryClient = useQueryClient()

  const handleSubmit = async (
    e: React.FormEvent,
    content: string,
    uploadedImage: UploadedImage | null
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
          ...(metadata ? { metadata } : {}),
          fingerprint,
        })

        if (res.ok) {
          let createdComment: any = null
          try {
            const data = await res.json()
            createdComment = (data as any)?.comment || null
          } catch {}

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
                isEdited: createdComment.isEdited ?? null,
                createdAt:
                  createdComment.createdAt ||
                  new Date().toISOString(),
                updatedAt:
                  createdComment.updatedAt ||
                  createdComment.createdAt ||
                  new Date().toISOString(),
                editedAt: createdComment.editedAt ?? null,
                userVote: createdComment.hasVoted ? "upvote" : null,
                role: null,
                isOwner: false,
                metadata: createdComment.metadata ?? null,
              }

              queryClient.setQueryData<{ comments: CommentData[] }>(
                ["comments", postId],
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
            } catch {}
          }

          resetForm()
          toast.success(parentId ? "Reply posted" : "Comment posted")
          try {
            window.dispatchEvent(
              new CustomEvent("comment:created", {
                detail: { postId, parentId: parentId || null },
              })
            )
          } catch {}

          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch {}

          onSuccess?.()
        } else if (res.status === 401) {
          toast.error("Please sign in to comment")
        } else if (res.status === 403) {
          try {
            const data = await res.json()
            const apiMessage =
              (data as any)?.message || (data as any)?.error?.message

            if (typeof apiMessage === "string" && apiMessage.length > 0) {
              toast.error(apiMessage)
            } else {
              toast.error("Comments are disabled")
            }
          } catch {
            toast.error("Comments are disabled")
          }
        } else {
          toast.error("Failed to post comment")
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
