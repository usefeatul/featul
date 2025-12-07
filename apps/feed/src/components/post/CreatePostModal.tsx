"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@feedgot/ui/components/dialog"
import { PostHeader } from "./PostHeader"
import { PostContent } from "./PostContent"
import { PostFooter } from "./PostFooter"
import { usePostSubmission } from "@/hooks/usePostSubmission"
import { client } from "@feedgot/api/client"
import { useRouter } from "next/navigation"

export function CreatePostModal({
  open,
  onOpenChange,
  workspaceSlug,
  user
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  workspaceSlug: string
  user?: any
}) {
  const router = useRouter()
  const [boards, setBoards] = useState<any[]>([])
  const [selectedBoard, setSelectedBoard] = useState<any>(null)

  const {
    title,
    setTitle,
    content,
    setContent,
    isPending,
    submitPost
  } = usePostSubmission({
    workspaceSlug,
    onSuccess: () => {
      onOpenChange(false)
    },
    onCreated: (post) => {
        router.push(`/workspaces/${workspaceSlug}/requests/${post.slug}`)
    },
    skipDefaultRedirect: true
  })

  useEffect(() => {
    if (open) {
      client.board.byWorkspaceSlug.$get({ slug: workspaceSlug }).then(async (res) => {
        if (res.ok) {
           const data = await res.json()
           const b = (data.boards || []).map((x: any) => ({ id: x.id, name: x.name, slug: x.slug }))
           setBoards(b)
           if (b.length > 0 && !selectedBoard) {
             setSelectedBoard(b[0])
           }
        }
      })
    }
  }, [open, workspaceSlug])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    submitPost(selectedBoard, user)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden border-none shadow-2xl top-[20%] translate-y-[-20%]">
        <form onSubmit={handleSubmit}>
          <PostHeader
            user={user || null}
            initials={user?.name?.[0] || "?"}
            boards={boards}
            selectedBoard={selectedBoard}
            onSelectBoard={setSelectedBoard}
            onClose={() => onOpenChange(false)}
          />
          <PostContent
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
          />
          <PostFooter isPending={isPending} disabled={!title || !content || !selectedBoard || isPending} />
        </form>
      </DialogContent>
    </Dialog>
  )
}
