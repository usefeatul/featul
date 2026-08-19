"use client"

import React, { useState, useEffect } from "react"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import DocumentTextIcon from "@featul/ui/icons/document-text"
import { PostHeader } from "./PostHeader"
import { PostContent } from "./PostContent"
import { PostFooter } from "./PostFooter"
import { usePostSubmission } from "@/hooks/usePostSubmission"
import { usePostImageUpload } from "@/hooks/usePostImageUpload"
import { useWorkspaceBoards } from "@/hooks/useWorkspaceBoards"
import { client } from "@featul/api/client"
import { useRouter } from "next/navigation"
import { useSimilarPosts } from "@/hooks/useSimilarPosts"
import { SimilarPosts } from "./SimilarPosts"
import type { TagSummary, PostUser } from "@/types/post"
import { canSubmitPostForm } from "@/hooks/postSubmitGuard"
import { createPostImageTransferHandlers } from "@/lib/post-image-transfer"

export function CreatePostModal({
  open,
  onOpenChange,
  workspaceSlug,
  user,
  initialStatus = "pending",
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  workspaceSlug: string
  user?: PostUser
  initialStatus?: string
}) {
  const router = useRouter()
  const { boards, selectedBoard, setSelectedBoard } = useWorkspaceBoards({
    open,
    workspaceSlug,
  })

  // New State for Status and Tags
  const [status, setStatus] = useState(initialStatus)
  const [availableTags, setAvailableTags] = useState<TagSummary[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setStatus(initialStatus)
    }
  }, [open, initialStatus])

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
  } = usePostImageUpload(workspaceSlug, selectedBoard?.slug)

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
      setUploadedImages([])
      // Reset fields
      setStatus(initialStatus)
      setSelectedTags([])
    },
    onCreated: (post) => {
      router.push(`/workspaces/${workspaceSlug}/requests/${post.slug}`)
    },
    skipDefaultRedirect: true
  })

  useEffect(() => {
    if (!open) return

    let canceled = false

    const fetchTags = async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug: workspaceSlug })
      if (!res.ok || canceled) return
      const data = (await res.json()) as { tags?: TagSummary[] } | null
      const tags = (Array.isArray(data?.tags) ? data.tags : []).map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        color: t.color
      }))
      if (!canceled) {
        setAvailableTags(tags)
      }
    }

    fetchTags()

    return () => {
      canceled = true
    }
  }, [open, workspaceSlug])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    // Find tag IDs from selected slugs/ids
    const tagIds = availableTags.filter(t => selectedTags.includes(t.id)).map(t => t.id)
    submitPost(selectedBoard, user ?? null, uploadedImages, status, tagIds)
  }

  const { posts: similarPosts } = useSimilarPosts({
    title,
    boardSlug: selectedBoard?.slug,
    workspaceSlug,
    enabled: open,
  })

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

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
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create post"
      width="widest"
      offsetY="10%"
      icon={<DocumentTextIcon className="size-3.5" />}
      expandable
    >
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col"
        {...imageTransfer}
      >
        <PostHeader
          user={user || null}
          initials={user?.name?.[0] || "?"}
          boards={boards}
          selectedBoard={selectedBoard}
          onSelectBoard={setSelectedBoard}
          status={status}
          onStatusChange={setStatus}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
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

        <SimilarPosts
          posts={similarPosts}
          linkPrefix={`/workspaces/${workspaceSlug}/requests`}
          onLinkClick={() => onOpenChange(false)}
        />
      </form>
    </SettingsDialogShell>
  )
}
