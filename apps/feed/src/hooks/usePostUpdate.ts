"use client"

import { useState, useTransition } from "react"
import { client } from "@oreilla/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UsePostUpdateProps {
  postId: string
  onSuccess: () => void
}

export function usePostUpdate({ postId, onSuccess }: UsePostUpdateProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const router = useRouter()

  const updatePost = async (selectedBoard: { slug: string } | null, image?: string | null, roadmapStatus?: string, tags?: string[]) => {
    if (!title || !content || !selectedBoard) return

    startTransition(async () => {
      try {
        const res = await client.post.update.$post({
          postId,
          title,
          content,
          image: image,
          boardSlug: selectedBoard.slug,
          roadmapStatus: roadmapStatus || undefined,
          tags: tags || undefined,
        })

        if (res.ok) {
          toast.success("Post updated successfully")
          onSuccess()
          router.refresh()
        } else {
          const err = await res.json()
          toast.error((err as any)?.message || "Failed to update post")
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
    updatePost
  }
}
