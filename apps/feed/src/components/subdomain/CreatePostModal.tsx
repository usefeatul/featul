"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@feedgot/ui/components/dialog"
import { getInitials } from "@/utils/user-utils"
import { PostHeader } from "./post/PostHeader"
import { PostContent } from "./post/PostContent"
import { PostFooter } from "./post/PostFooter"
import { useCreatePostData } from "./post/useCreatePostData"
import { usePostSubmission } from "./post/usePostSubmission"

interface CreatePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceSlug: string
  boardSlug: string
}

export default function CreatePostModal({
  open,
  onOpenChange,
  workspaceSlug,
  boardSlug,
}: CreatePostModalProps) {
  const { user, boards, selectedBoard, setSelectedBoard } = useCreatePostData({
    open,
    workspaceSlug,
    boardSlug
  })

  const {
    title,
    setTitle,
    content,
    setContent,
    isPending,
    submitPost
  } = usePostSubmission({
    workspaceSlug,
    onSuccess: () => onOpenChange(false)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitPost(selectedBoard, user)
  }

  const initials = user?.name ? getInitials(user.name) : "?"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden border-none shadow-2xl top-[20%] translate-y-[-20%]">
        <DialogTitle className="sr-only">Create a Post</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <PostHeader
            user={user}
            initials={initials}
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

          <PostFooter
            isPending={isPending}
            disabled={!title || !content || !selectedBoard || isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
