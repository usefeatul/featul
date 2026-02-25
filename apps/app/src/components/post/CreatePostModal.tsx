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

export function CreatePostModal({
  open,
  onOpenChange,
  workspaceSlug,
  user
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  workspaceSlug: string
  user?: PostUser
}) {
  const router = useRouter()
  const { boards, selectedBoard, setSelectedBoard } = useWorkspaceBoards({
    open,
    workspaceSlug,
  })

  // New State for Status and Tags
  const [status, setStatus] = useState("pending")
  const [availableTags, setAvailableTags] = useState<TagSummary[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const {
    uploadedImage,
    uploadingImage,
    fileInputRef,
    setUploadedImage,
    handleFileSelect,
    handleRemoveImage,
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
      setUploadedImage(null)
      // Reset fields
      setStatus("pending")
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
    submitPost(selectedBoard, user ?? null, uploadedImage?.url, status, tagIds)
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

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create post"
      width="widest"
      offsetY="10%"
      icon={<DocumentTextIcon className="size-3.5" />}
    >
      <form onSubmit={handleSubmit}>
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
          uploadedImage={uploadedImage}
          uploadingImage={uploadingImage}
          handleRemoveImage={handleRemoveImage}
        />

        <PostFooter
          isPending={isPending}
          disabled={!canSubmit}
          uploadedImage={uploadedImage}
          uploadingImage={uploadingImage}
          fileInputRef={fileInputRef}
          handleFileSelect={handleFileSelect}
          ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
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
