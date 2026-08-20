"use client"

import React from "react"
import { Input } from "@featul/ui/components/input"
import { TextareaAutosize } from "@featul/ui/components/TextareaAutosize"
import { useDialogExpanded } from "@/components/settings/global/SettingsDialogShell"
import { continuePlainList, indentPlainList } from "@/lib/list/plain"
import { PostImageGallery } from "@/components/post/PostImageGallery"

export interface UploadedImage {
  url: string
  name: string
  type: string
}

export interface PostContentProps {
  title: string
  setTitle: (value: string) => void
  content: string
  setContent: (value: string) => void
  uploadedImages: UploadedImage[]
  uploadingImage: boolean
  handleRemoveImage: (index: number) => void
}

export function PostContent({
  title,
  setTitle,
  content,
  setContent,
  uploadedImages,
  uploadingImage,
  handleRemoveImage,
}: PostContentProps) {
  const expanded = useDialogExpanded()
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const pendingCaretRef = React.useRef<number | null>(null)

  React.useLayoutEffect(() => {
    const caret = pendingCaretRef.current
    const node = textareaRef.current
    if (caret === null || !node) {
      return
    }
    node.selectionStart = caret
    node.selectionEnd = caret
    pendingCaretRef.current = null
  }, [content])

  const submitForm = (from: HTMLElement) => {
    const form = from.closest("form")
    if (!form) {
      return
    }
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')
    if (submit?.disabled) {
      return
    }
    form.requestSubmit()
  }

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key !== "Enter" ||
      event.nativeEvent.isComposing ||
      !(event.metaKey || event.ctrlKey)
    ) {
      return
    }
    event.preventDefault()
    submitForm(event.currentTarget)
  }

  const handleContentKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.nativeEvent.isComposing) {
      return
    }

    const textarea = event.currentTarget

    if (event.key === "Tab") {
      const result = indentPlainList(
        content,
        textarea.selectionStart,
        textarea.selectionEnd,
        event.shiftKey ? "out" : "in"
      )
      if (!result) {
        return
      }
      event.preventDefault()
      pendingCaretRef.current = result.nextCaret
      setContent(result.nextValue)
      return
    }

    if (event.key !== "Enter") {
      return
    }

    if (event.metaKey || event.ctrlKey) {
      event.preventDefault()
      submitForm(event.currentTarget)
      return
    }

    if (event.shiftKey) {
      return
    }

    const result = continuePlainList(
      content,
      textarea.selectionStart,
      textarea.selectionEnd
    )
    if (!result) {
      return
    }

    event.preventDefault()
    pendingCaretRef.current = result.nextCaret
    setContent(result.nextValue)
  }

  return (
    <div className="px-3 md:px-4 flex min-h-0 flex-1 flex-col gap-2">
      <Input
        variant="plain"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        required
        maxLength={100}
        className="text-lg md:text-xl  font-semibold h-auto py-2 placeholder:text-accent "
      />
      <div
        className="flex min-h-0 flex-1 cursor-text flex-col"
        onClick={() => textareaRef.current?.focus()}
      >
        <TextareaAutosize
          ref={textareaRef}
          placeholder="Add post contents"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleContentKeyDown}
          minRows={2}
          maxRows={expanded ? 22 : 10}
          className={`w-full resize-none min-h-[72px] overflow-y-auto py-2 text-base placeholder:text-accent wrap-break-word border-none outline-none ${expanded ? "max-h-[52dvh]" : "max-h-[32dvh]"}`}
        />
      </div>
      
      {uploadedImages.length > 0 ? (
        <PostImageGallery
          items={uploadedImages}
          alt="Post image"
          className="mb-1"
          onRemove={handleRemoveImage}
          removeDisabled={uploadingImage}
        />
      ) : null}
    </div>
  )
}
