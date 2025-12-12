"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@oreilla/ui/components/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { PostHeader } from "./PostHeader"
import { PostContent } from "./PostContent"
import { PostFooter } from "./PostFooter"
import { usePostSubmission } from "@/hooks/usePostSubmission"
import { usePostImageUpload } from "@/hooks/usePostImageUpload"
import { client } from "@oreilla/api/client"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/useDebounce"
import { SimilarPosts } from "./SimilarPosts"

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
  
  // New State for Status and Tags
  const [status, setStatus] = useState("pending")
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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
    if (open) {
      // Fetch Boards
      client.board.byWorkspaceSlug.$get({ slug: workspaceSlug }).then(async (res) => {
        if (res.ok) {
           const data = await res.json()
           const b = (data.boards || [])
             .filter((x: any) => !['roadmap', 'changelog'].includes(x.slug))
             .map((x: any) => ({ id: x.id, name: x.name, slug: x.slug }))
           setBoards(b)
           if (b.length > 0 && !selectedBoard) {
             setSelectedBoard(b[0])
           }
        }
      })

      // Fetch Tags
      client.board.tagsByWorkspaceSlug.$get({ slug: workspaceSlug }).then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          const tags = (data?.tags || []).map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color }))
          setAvailableTags(tags)
        }
      })
    }
  }, [open, workspaceSlug])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    // Find tag IDs from selected slugs/ids
    const tagIds = availableTags.filter(t => selectedTags.includes(t.id)).map(t => t.id)
    submitPost(selectedBoard, user, uploadedImage?.url, status, tagIds)
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

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden border-none shadow-2xl top-[20%] translate-y-[-20%]">
        <VisuallyHidden>
          <DialogTitle>Create Post</DialogTitle>
        </VisuallyHidden>
        <form onSubmit={handleSubmit}>
          <PostHeader
            user={user || null}
            initials={user?.name?.[0] || "?"}
            boards={boards}
            selectedBoard={selectedBoard}
            onSelectBoard={setSelectedBoard}
            onClose={() => onOpenChange(false)}
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
            disabled={!title || !content || !selectedBoard || isPending || uploadingImage} 
            uploadedImage={uploadedImage}
            uploadingImage={uploadingImage}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
            ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
          />

          <SimilarPosts posts={similarPosts} isLoading={isSearchingSimilar} />
        </form>
      </DialogContent>
    </Dialog>
  )
}
