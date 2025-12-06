"use client"

import React, { useState, useTransition, useRef, useMemo } from "react"
import MentionList from "./MentionList"
import { Textarea } from "@feedgot/ui/components/textarea"
import { Button } from "@feedgot/ui/components/button"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"
import { LoaderIcon } from "@feedgot/ui/icons/loader"
import { ImageIcon  } from "@feedgot/ui/icons/image"
import { getCommentImageUploadUrl } from "@/lib/comment-service"
import CommentImage from "./CommentImage"
import { XMarkIcon } from "@feedgot/ui/icons/xmark"


interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
  buttonText?: string
  workspaceSlug?: string
}

export default function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false,
  buttonText = "Comment",
  workspaceSlug,
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()
  const [uploadedImage, setUploadedImage] = useState<{ url: string; name: string; type: string } | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionIndex, setMentionIndex] = useState(0)
  const [members, setMembers] = useState<Array<{ id: string; name: string; image?: string | null; email?: string | null }>>([])

  const filteredCandidates = useMemo(() => {
    const q = (mentionQuery || "").trim().toLowerCase()
    return members
      .map((m: any) => ({ userId: m.userId || m.id, name: m.name || "", email: m.email || null, image: m.image || null }))
      .filter((m) => (m.name || "").toLowerCase().includes(q))
  }, [members, mentionQuery])

  const insertMention = (name: string) => {
    const el = textareaRef.current
    if (!el) return
    const caret = el.selectionStart || content.length
    const upto = content.slice(0, caret)
    const at = upto.lastIndexOf("@")
    if (at < 0) return
    const before = content.slice(0, at)
    const afterCaret = content.slice(caret)
    const nextContent = `${before}@${name} ${afterCaret}`
    setContent(nextContent)
    setMentionOpen(false)
    setMentionQuery("")
    setMentionIndex(0)
    // Reset caret to after inserted mention
    setTimeout(() => {
      const pos = before.length + 1 + name.length + 1
      try {
        el.focus()
        el.setSelectionRange(pos, pos)
      } catch {}
    }, 0)
  }

  const allowedImageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"]
  const maxImageSize = 5 * 1024 * 1024 // 5MB

  const handleImageUpload = async (file: File) => {
    if (!allowedImageTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please use PNG, JPEG, WebP, or GIF.")
      return
    }
    if (file.size > maxImageSize) {
      toast.error("Image too large. Maximum size is 5MB.")
      return
    }

    setUploadingImage(true)
    const toastId = toast.loading("Uploading image...")

    try {
      const { uploadUrl, publicUrl } = await getCommentImageUploadUrl(
        postId,
        file.name,
        file.type
      )

      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      setUploadedImage({
        url: publicUrl,
        name: file.name,
        type: file.type,
      })
      toast.success("Image uploaded", { id: toastId })
    } catch (error: any) {
      toast.error(error?.message || "Failed to upload image", { id: toastId })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!content.trim() && !uploadedImage) || isPending) return

    startTransition(async () => {
      try {
        const metadata = uploadedImage
          ? {
              attachments: [
                {
                  name: uploadedImage.name,
                  url: uploadedImage.url,
                  type: uploadedImage.type,
                },
              ],
            }
          : undefined

        const res = await client.comment.create.$post({
          postId,
          content: content.trim() || "",
          ...(parentId ? { parentId } : {}),
          ...(metadata ? { metadata } : {}),
        })

        if (res.ok) {
          setContent("")
          setUploadedImage(null)
          toast.success(parentId ? "Reply posted" : "Comment posted")
          try {
            window.dispatchEvent(
              new CustomEvent("comment:created", {
                detail: { postId, parentId: parentId || null },
              })
            )
          } catch {}
          onSuccess?.()
        } else if (res.status === 401) {
          toast.error("Please sign in to comment")
        } else if (res.status === 403) {
          const data = await res.json()
          toast.error((data as any)?.message || "Comments are disabled")
        } else {
          toast.error("Failed to post comment")
        }
      } catch (error) {
        console.error("Failed to post comment:", error)
        toast.error("Failed to post comment")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="relative">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          const next = e.target.value
          setContent(next)
          if (!workspaceSlug) return
          const caret = e.target.selectionStart || next.length
          const upto = next.slice(0, caret)
          const at = upto.lastIndexOf("@")
          if (at >= 0) {
            const after = next.slice(at + 1, caret)
            const valid = /^[A-Za-z0-9._-]*$/.test(after)
            const beforeChar = upto[at - 1]
            const boundary = !beforeChar || /\s|[().,;:!?\[\]{}]/.test(beforeChar)
            if (boundary && valid) {
              setMentionQuery(after)
              setMentionOpen(true)
              setMentionIndex(0)
              if (members.length === 0) {
                try {
                  client.team.membersByWorkspaceSlug.$get({ slug: workspaceSlug }).then(async (res) => {
                    if (res.ok) {
                      const data = await res.json()
                      setMembers((data as any)?.members || [])
                    }
                  })
                } catch {}
              }
            } else {
              setMentionOpen(false)
            }
          } else {
            setMentionOpen(false)
          }
        }}
        placeholder={placeholder}
        className="min-h-[60px] resize-none text-sm shadow-none bg-background  placeholder:text-accent"
        autoFocus={autoFocus}
        disabled={isPending || uploadingImage}
        onKeyDown={(e) => {
          if (!mentionOpen) return
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setMentionIndex((i) => Math.min(i + 1, filteredCandidates.length - 1))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setMentionIndex((i) => Math.max(i - 1, 0))
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault()
            const sel = filteredCandidates[mentionIndex]
            if (sel) insertMention(sel.name || "")
          } else if (e.key === "Escape") {
            setMentionOpen(false)
          }
        }}
      />

      {mentionOpen && filteredCandidates.length > 0 && textareaRef.current && (
        <MentionList
          candidates={filteredCandidates.map((m) => ({ id: m.userId, name: m.name || "", image: m.image, email: m.email }))}
          selectedIndex={mentionIndex}
          onSelect={(user) => insertMention(user.name)}
          className="left-2 top-full mt-1"
        />
      )}
      </div>

      {/* Image Preview */}
      {uploadedImage && (
        <div className="relative inline-block">
          <div className="relative">
            <CommentImage
              url={uploadedImage.url}
              alt={uploadedImage.name}
              className="max-w-[120px] max-h-20"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-1 -right-1 rounded-xl bg-destructive text-destructive-foreground p-0.5 hover:bg-destructive/90 transition-colors  z-10 cursor-pointer"
              disabled={isPending || uploadingImage}
              aria-label="Remove image"
            >

              <XMarkIcon className="size-3" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedImageTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isPending || uploadingImage}
          />
          <Button
            type="button"
            size="xs"
            variant="nav"
            className="h-8 w-8 p-0 rounded-full dark:bg-black/40"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || uploadingImage || !!uploadedImage}
            aria-label="Add image"
          >
            {uploadingImage ? (
              <LoaderIcon className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4 " />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="xs"
            variant="nav"
            disabled={(!content.trim() && !uploadedImage) || isPending || uploadingImage}
          >
            {isPending && <LoaderIcon className="mr-2 h-3 w-3 animate-spin" />}
            {buttonText}
          </Button>
          {onCancel && (
            <Button
              type="button"
              size="xs"
              variant="nav"
              onClick={onCancel}
              disabled={isPending || uploadingImage}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
