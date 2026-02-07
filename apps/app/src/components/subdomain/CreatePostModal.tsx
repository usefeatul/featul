"use client"

import React from "react"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import DocumentTextIcon from "@featul/ui/icons/document-text"
import { getInitials } from "@/utils/user-utils"
import { PostHeader } from "../post/PostHeader"
import { PostContent } from "../post/PostContent"
import { PostFooter } from "../post/PostFooter"
import { useCreatePostData } from "../../hooks/useCreatePostData"
import { usePostSubmission } from "../../hooks/usePostSubmission"
import { usePostImageUpload } from "../../hooks/usePostImageUpload"
import { useSimilarPosts } from "@/hooks/useSimilarPosts"
import { SimilarPosts } from "../post/SimilarPosts"

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
    uploadedImage,
    uploadingImage,
    fileInputRef,
    setUploadedImage,
    handleFileSelect,
    handleRemoveImage,
    ALLOWED_IMAGE_TYPES,
  } = usePostImageUpload(workspaceSlug)

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
      setUploadedImage(null)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitPost(selectedBoard, user, uploadedImage?.url)
  }

  const { posts: similarPosts } = useSimilarPosts({
    title,
    boardSlug: selectedBoard?.slug,
    workspaceSlug,
    enabled: open,
  })

  const initials = user?.name ? getInitials(user.name) : "?"

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create post"
      // description="Share an idea or request"
      width="widest"
      offsetY="10%"
      icon={<DocumentTextIcon className="size-3.5" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full pb-3">
        <PostHeader
          user={user}
          initials={initials}
          boards={boards}
          selectedBoard={selectedBoard}
          onSelectBoard={setSelectedBoard}
        />

        <PostContent
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          uploadedImage={uploadedImage}
          uploadingImage={uploadingImage}
          handleRemoveImage={handleRemoveImage}
        />

        <PostFooter
          isPending={isPending}
          disabled={!title || !content || !selectedBoard || isPending || uploadingImage}
          uploadedImage={uploadedImage}
          uploadingImage={uploadingImage}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
        />

        <SimilarPosts
          posts={similarPosts}
          onLinkClick={() => onOpenChange(false)}
        />
      </form>
    </SettingsDialogShell>
  )
}
