"use client"

import { useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { client } from "@oreilla/api/client"
import { Button } from "@oreilla/ui/components/button"
import { toast } from "sonner"
import { cn } from "@oreilla/ui/lib/utils"
import { ChangelogEditor, type ChangelogEditorRef } from "@/components/changelog/changelog-editor"
import { TextareaAutosize } from "@/components/editor/TextareaAutosize"

export default function NewChangelogEntryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [title, setTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<ChangelogEditorRef>(null)

  // Auto-resize title textarea
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = e.target.scrollHeight + "px"
  }

  const handleAddCover = () => {
    const url = window.prompt("Enter cover image URL")
    if (url) {
      setCoverImage(url)
    }
  }

  const handleSave = useCallback(
    async (status: "draft" | "published") => {
      if (!title.trim()) {
        toast.error("Please add a title")
        titleRef.current?.focus()
        return
      }

      const content = editorRef.current?.getContent()
      if (!content) return

      setSaving(true)
      try {
        // Extract first paragraph as summary
        const firstParagraph = content.content?.find(
          (node) => node.type === "paragraph" && node.content?.length
        )
        const summary = firstParagraph?.content
          ?.map((n) => n.text || "")
          .join("")
          .slice(0, 200)

        const res = await client.changelog.entriesCreate.$post({
          slug,
          title: title.trim(),
          content: { type: content.type || "doc", content: content.content },
          summary: summary || undefined,
          coverImage: coverImage || undefined,
          status,
        })
        const data = await res.json()

        if ((data as any).ok) {
          toast.success(status === "published" ? "Published!" : "Draft saved!")
          router.push(`/workspaces/${slug}/changelog`)
        } else {
          toast.error("Failed to save")
        }
      } catch (err) {
        toast.error("Failed to save")
      } finally {
        setSaving(false)
      }
    },
    [slug, title, coverImage, router]
  )

  return (
    <>
      {/* Floating header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/workspaces/${slug}/changelog`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSave("draft")}
              disabled={saving}
            >
              Save draft
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave("published")}
              disabled={saving}
            >
              {saving ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="py-8">
        {/* Cover image */}
        {coverImage ? (
          <div className="relative mb-8 group">
            <div className="relative w-full h-[280px] rounded-lg overflow-hidden">
              <Image
                src={coverImage}
                alt="Cover"
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized
                loader={({ src }) => src}
              />
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleAddCover}>
                Change cover
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCoverImage(null)}>
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleAddCover}
            className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 opacity-0 hover:opacity-100 focus:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            Add cover
          </button>
        )}

        {/* Title */}
        <TextareaAutosize
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          onEnterPress={() => editorRef.current?.focus()}
          placeholder="Untitled"
          className={cn(
            "w-full text-4xl font-bold tracking-tight bg-transparent border-none outline-none resize-none",
            "placeholder:text-muted-foreground/40",
            "mb-4"
          )}
          minRows={1}
          autoFocus
        />

        {/* Date indicator */}
        <div className="text-sm text-muted-foreground mb-8">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        {/* Content editor */}
        <ChangelogEditor ref={editorRef} />
      </div>
    </>
  )
}
