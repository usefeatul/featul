"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getPostTitleMinError } from "@/hooks/postSubmitGuard"
import { readApiErrorMessage } from "@/hooks/postApiError"

interface UsePostUpdateProps {
  postId: string
  onSuccess: () => void
}

export function usePostUpdate({ postId, onSuccess }: UsePostUpdateProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const router = useRouter()
  const queryClient = useQueryClient()

  const updatePost = async (selectedBoard: { slug: string } | null, image?: string | null, roadmapStatus?: string, tags?: string[]) => {
    if (!selectedBoard) return

    const normalizedTitle = title.trim()
    const normalizedContent = content.trim()
    const titleError = getPostTitleMinError(normalizedTitle)
    if (titleError) {
      toast.error(titleError)
      return
    }

    startTransition(async () => {
      try {
        const res = await client.post.update.$post({
          postId,
          title: normalizedTitle,
          content: normalizedContent,
          image: image,
          boardSlug: selectedBoard.slug,
          roadmapStatus: roadmapStatus || undefined,
          tags: tags || undefined,
        })

        if (res.ok) {
          toast.success("Post updated successfully")
          onSuccess()

          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch {
            // ignore
          }

          router.refresh()
        } else {
          const message = await readApiErrorMessage(res, "Failed to update post", "title")
          toast.error(message)
        }
      } catch (error) {
        console.error("Failed to update post:", error)
        toast.error("Failed to update post")
      }
    })
  }

  return {
    title,
    setTitle,
    content,
    setContent,
    isPending,
    updatePost,
  }
}
