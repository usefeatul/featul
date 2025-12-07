"use client"

import { useState, useTransition } from "react"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import { getBrowserFingerprint } from "@/utils/fingerprint"
import { useRouter } from "next/navigation"

interface UsePostSubmissionProps {
  workspaceSlug: string
  onSuccess: () => void
  onCreated?: (post: any) => void
  skipDefaultRedirect?: boolean
}

export function usePostSubmission({ workspaceSlug, onSuccess, onCreated, skipDefaultRedirect }: UsePostSubmissionProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const router = useRouter()

  const submitPost = async (selectedBoard: { slug: string } | null, user: any) => {
    if (!title || !content || !selectedBoard) return

    const fingerprint = await getBrowserFingerprint()

    startTransition(async () => {
      try {
        const res = await client.post.create.$post({
          title,
          content,
          workspaceSlug,
          boardSlug: selectedBoard.slug,
          fingerprint: user ? undefined : fingerprint,
        })

        if (res.ok) {
          const data = await res.json()
          toast.success("Post submitted successfully")
          setTitle("")
          setContent("")
          onSuccess()
          if (onCreated) {
            onCreated(data.post)
          }
          if (!skipDefaultRedirect) {
            router.push(`/board/p/${data.post.slug}`)
          }
        } else {
          const err = await res.json()
          if (res.status === 401) {
             toast.error("Anonymous posting is not allowed on this board")
          } else {
             toast.error((err as any)?.message || "Failed to submit post")
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
    submitPost
  }
}
