"use client"

import React from "react"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import DocumentTextIcon from "@oreilla/ui/icons/document-text"
import { getInitials } from "@/utils/user-utils"
import { PostHeader } from "../post/PostHeader"
import { PostContent } from "../post/PostContent"
import { PostFooter } from "../post/PostFooter"
import { useCreatePostData } from "../../hooks/useCreatePostData"
import { usePostSubmission } from "../../hooks/usePostSubmission"
import { usePostImageUpload } from "../../hooks/usePostImageUpload"
import { useState, useEffect } from "react"
import { client } from "@oreilla/api/client"
import { useDebounce } from "../../hooks/useDebounce"
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

  const [similarPosts, setSimilarPosts] = useState<any[]>([])
  const [isSearchingSimilar, setIsSearchingSimilar] = useState(false)
  
  const debouncedTitle = useDebounce(title, 1000)

  useEffect(() => {
    async function fetchSimilar() {
      if (debouncedTitle.length < 3 || !selectedBoard) {
        setSimilarPosts([])
        return
      }
      
      setIsSearchingSimilar(true)
      try {
        const res = await client.post.getSimilar.$get({
          title: debouncedTitle,
          boardSlug: selectedBoard.slug,
          workspaceSlug,
        })
        if (res.ok) {
           const data = await res.json()
           setSimilarPosts(data.posts)
        }
      } catch (e) {
        console.error("Failed to fetch similar posts", e)
      } finally {
        setIsSearchingSimilar(false)
      }
    }

    fetchSimilar()
  }, [debouncedTitle, selectedBoard])

  const initials = user?.name ? getInitials(user.name) : "?"

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create post"
      // description="Share an idea or request"
      width="widest"
      icon={<DocumentTextIcon className="size-3.5" />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
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
        
        <SimilarPosts posts={similarPosts} />
      </form>
    </SettingsDialogShell>
  )
}
