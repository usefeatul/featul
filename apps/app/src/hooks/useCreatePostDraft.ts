import { useEffect, useRef } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import {
  clearCreatePostDraft,
  readCreatePostDraft,
  writeCreatePostDraft,
} from "@/lib/create-post-draft"
import type { UploadedImage } from "@/hooks/useSignedImageUpload"

export function useCreatePostDraft({
  workspaceSlug,
  open,
  title,
  content,
  images,
  setTitle,
  setContent,
  setImages,
}: {
  workspaceSlug: string
  open: boolean
  title: string
  content: string
  images: UploadedImage[]
  setTitle: (value: string) => void
  setContent: (value: string) => void
  setImages: (value: UploadedImage[]) => void
}) {
  const restoredForOpenRef = useRef(false)
  const skipPersistRef = useRef(false)
  const wasOpenRef = useRef(false)
  const debouncedTitle = useDebounce(title, 300)
  const debouncedContent = useDebounce(content, 300)
  const debouncedImages = useDebounce(images, 300)

  useEffect(() => {
    if (!open) {
      restoredForOpenRef.current = false
      return
    }
    if (restoredForOpenRef.current) {
      return
    }
    restoredForOpenRef.current = true
    const draft = readCreatePostDraft(workspaceSlug)
    if (!draft) {
      return
    }
    skipPersistRef.current = true
    setTitle(draft.title)
    setContent(draft.content)
    setImages(draft.images)
  }, [open, workspaceSlug, setTitle, setContent, setImages])

  useEffect(() => {
    if (!open) {
      return
    }
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    writeCreatePostDraft(workspaceSlug, {
      title: debouncedTitle,
      content: debouncedContent,
      images: debouncedImages,
    })
  }, [open, workspaceSlug, debouncedTitle, debouncedContent, debouncedImages])

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      return
    }
    if (!wasOpenRef.current) {
      return
    }
    wasOpenRef.current = false
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    writeCreatePostDraft(workspaceSlug, { title, content, images })
  }, [open, workspaceSlug, title, content, images])

  return {
    clearDraft: () => {
      skipPersistRef.current = true
      clearCreatePostDraft(workspaceSlug)
    },
  }
}
