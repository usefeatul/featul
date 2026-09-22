"use client"

import React from "react"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import DocumentTextIcon from "@featul/ui/icons/document-text"
import { getInitials } from "@/utils/user"
import { PostHeader } from "../post/PostHeader"
import { PostContent } from "../post/PostContent"
import { PostFooter } from "../post/PostFooter"
import { useCreatePostData } from "../../hooks/useCreatePostData"
import { usePostSubmission } from "../../hooks/usePostSubmission"
import { usePostUpload } from "../../hooks/usePostUpload"
import { useSimilarPosts } from "@/hooks/useSimilarPosts"
import { SimilarPosts } from "../post/SimilarPosts"
import { canSubmitPostForm } from "@/hooks/postSubmitGuard"
import SubdomainAuthModal from "./SubdomainAuthModal"
import { useSubdomainAuthModal } from "@/hooks/useSubdomainAuthModal"
import { useCloseThenOpenAuth } from "@/hooks/useCloseThenOpenAuth"
import { createPostImageTransferHandlers } from "@/lib/post/transfer"
import { useDraft } from "@/hooks/useDraft"

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
  const {
    isOpen: isAuthOpen,
    mode: authMode,
    redirectTo: authRedirect,
    setOpen: setAuthOpen,
    setMode: setAuthMode,
    openAuth,
  } = useSubdomainAuthModal()

  const { closeThenOpenAuth } = useCloseThenOpenAuth({
    closeCurrent: () => onOpenChange(false),
    openAuth,
  })

  const { user, boards, selectedBoard, setSelectedBoard } = useCreatePostData({
    open,
    workspaceSlug,
    boardSlug
  })

  const {
    uploadedImages,
    uploadingImage,
    fileInputRef,
    setUploadedImages,
    handleFileSelect,
    handleImageFiles,
    handleRemoveImage,
    maxFiles,
    ALLOWED_IMAGE_TYPES,
  } = usePostUpload(workspaceSlug, selectedBoard?.slug)

  const clearDraftRef = React.useRef(() => {})

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
      clearDraftRef.current()
      onOpenChange(false)
      setUploadedImages([])
    },
    onAuthRequired: () => closeThenOpenAuth("sign-in"),
  })

  const { clearDraft } = useDraft({
    workspaceSlug,
    open,
    title,
    content,
    images: uploadedImages,
    setTitle,
    setContent,
    setImages: setUploadedImages,
  })
  clearDraftRef.current = clearDraft

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitPost(selectedBoard, user, uploadedImages)
  }

  const { posts: similarPosts } = useSimilarPosts({
    title,
    boardSlug: selectedBoard?.slug,
    workspaceSlug,
    enabled: open,
  })

  const initials = user?.name ? getInitials(user.name) : "?"
  const canSubmit = canSubmitPostForm({
    title,
    hasSelectedBoard: !!selectedBoard,
    isPending,
    uploadingImage,
  })
  const imageTransfer = createPostImageTransferHandlers({
    onImageFiles: handleImageFiles,
    uploading: uploadingImage,
    imageCount: uploadedImages.length,
    maxImages: maxFiles,
  })

  return (
    <>
      <SettingsDialogShell
        open={open}
        onOpenChange={onOpenChange}
        title="Create post"
        // description="Share an idea or request"
        width="widest"
        offsetY="10%"
        icon={<DocumentTextIcon className="size-3.5" />}
        expandable
      >
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col pb-3"
          {...imageTransfer}
        >
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
            uploadedImages={uploadedImages}
            uploadingImage={uploadingImage}
            handleRemoveImage={handleRemoveImage}
          />

          <SimilarPosts
            posts={similarPosts}
            onLinkClick={() => onOpenChange(false)}
          />

          <PostFooter
            isPending={isPending}
            disabled={!canSubmit}
            uploadedImages={uploadedImages}
            uploadingImage={uploadingImage}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
            ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
            maxImages={maxFiles}
          />
        </form>
      </SettingsDialogShell>

      <SubdomainAuthModal
        open={isAuthOpen}
        onOpenChange={setAuthOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        redirectTo={authRedirect}
      />
    </>
  )
}
