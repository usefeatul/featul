"use client"

import { useState, useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { getBrowserFingerprint } from "@/utils/fingerprint"
import { useRouter } from "next/navigation"
import type { BoardSummary, PostUser } from "@/types/post"
import { getPostTitleMinError } from "@/hooks/postSubmitGuard"
import { readApiErrorMessage } from "@/hooks/postApiError"

interface UsePostSubmissionProps {
  workspaceSlug: string
  onSuccess: () => void
  onCreated?: (post: { slug: string }) => void
  skipDefaultRedirect?: boolean
  onAuthRequired?: () => void
}

type BoardRef = Pick<BoardSummary, "slug" | "allowAnonymous">

export function usePostSubmission({
  workspaceSlug,
  onSuccess,
  onCreated,
  skipDefaultRedirect,
  onAuthRequired,
}: UsePostSubmissionProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const router = useRouter()
  const queryClient = useQueryClient()

  const submitPost = async (
    selectedBoard: BoardRef | null,
    user: PostUser | null,
    image?: string | null,
    roadmapStatus?: string,
    tags?: string[]
  ) => {
    if (!selectedBoard) return

    const normalizedTitle = title.trim()
    const normalizedContent = content.trim()
    const titleError = getPostTitleMinError(normalizedTitle)
    if (titleError) {
      toast.error(titleError)
      return
    }

    const requiresSignIn = !user && selectedBoard.allowAnonymous === false
    if (requiresSignIn) {
      onAuthRequired?.()
      toast.error("Please sign in to submit a post on this board")
      return
    }

    const fingerprint = user ? undefined : await getBrowserFingerprint()

    startTransition(async () => {
      try {
        const res = await client.post.create.$post({
          title: normalizedTitle,
          content: normalizedContent,
          image: image || undefined,
          workspaceSlug,
          boardSlug: selectedBoard.slug,
          fingerprint: user ? undefined : fingerprint,
          roadmapStatus: roadmapStatus || undefined,
          tags: tags || undefined,
        })

        if (res.ok) {
          const data = await res.json()
          toast.success("Post submitted successfully")
          setTitle("")
          setContent("")
          onSuccess()

          try {
            queryClient.invalidateQueries({ queryKey: ["member-stats"] })
            queryClient.invalidateQueries({ queryKey: ["member-activity"] })
          } catch {
            // ignore
          }

          if (onCreated) {
            onCreated(data.post)
          }
          if (!skipDefaultRedirect) {
            router.push(`/board/p/${data.post.slug}`)
          }
        } else {
          if (res.status === 401) {
            onAuthRequired?.()
            toast.error("Please sign in to submit a post on this board")
          } else {
            const message = await readApiErrorMessage(res, "Failed to submit post", "title")
            toast.error(message)
          }
        }
      } catch (error) {
        console.error("Failed to create post:", error)
        toast.error("Failed to submit post")
      }
    })
  }

  return {
    title,
    setTitle,
    content,
    setContent,
    isPending,
    submitPost,
  }
}
