import { useTransition } from "react"
import { toast } from "sonner"
import { client } from "@oreilla/api/client"
import { UploadedImage } from "./useImageUpload"
import { getBrowserFingerprint } from "@/utils/fingerprint"

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
          resetForm()
          toast.success(parentId ? "Reply posted" : "Comment posted")
          try {
            window.dispatchEvent(
              new CustomEvent("comment:created", {
                detail: { postId, parentId: parentId || null },
              })
            )
          } catch {}
          onSuccess?.()
        } else if (res.status === 401) {
          toast.error("Please sign in to comment")
        } else if (res.status === 403) {
          const data = await res.json()
          toast.error((data as any)?.message || "Comments are disabled")
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
