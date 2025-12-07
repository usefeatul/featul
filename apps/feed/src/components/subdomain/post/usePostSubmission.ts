"use client"

import { useState, useTransition } from "react"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import { getBrowserFingerprint } from "@/utils/fingerprint"

interface UsePostSubmissionProps {
  workspaceSlug: string
  onSuccess: () => void
}

export function usePostSubmission({ workspaceSlug, onSuccess }: UsePostSubmissionProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

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
          toast.success("Post submitted successfully")
          setTitle("")
          setContent("")
          onSuccess()
          // Refresh the page to show the new post
          window.location.reload()
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
