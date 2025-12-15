"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { type JSONContent } from "@tiptap/react"
import { client } from "@oreilla/api/client"
import { Button } from "@oreilla/ui/components/button"
import { Badge } from "@oreilla/ui/components/badge"
import { Skeleton } from "@oreilla/ui/components/skeleton"
import { toast } from "sonner"
import { cn } from "@oreilla/ui/lib/utils"
import { NotionEditor, type NotionEditorRef } from "@oreilla/editor"

export default function EditChangelogEntryPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const entryId = searchParams.get("id")

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft")
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [initialContent, setInitialContent] = useState<JSONContent | null>(null)
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<NotionEditorRef>(null)

  useEffect(() => {
    if (!entryId) {
      toast.error("Entry ID is required")
      router.push(`/workspaces/${slug}/changelog`)
      return
    }

    async function loadEntry() {
      try {
        const res = await client.changelog.entriesGetForEdit.$get({
          slug,
          entryId: entryId!,
        })
        const data = await res.json()
        const entry = (data as any)?.entry

        if (!entry) {
          toast.error("Entry not found")
          router.push(`/workspaces/${slug}/changelog`)
          return
        }

        setTitle(entry.title)
        setCoverImage(entry.coverImage || null)
        setStatus(entry.status)
        setPublishedAt(entry.publishedAt)
        setInitialContent(entry.content as JSONContent)
      } catch (err) {
        toast.error("Failed to load entry")
        router.push(`/workspaces/${slug}/changelog`)
      } finally {
        setLoading(false)
      }
    }

    loadEntry()
  }, [entryId, slug, router])

  // Auto-resize title textarea
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = e.target.scrollHeight + "px"
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      editorRef.current?.focus()
    }
  }

  const handleAddCover = () => {
    const url = window.prompt("Enter cover image URL")
    if (url) {
      setCoverImage(url)
    }
  }

  const handleSave = useCallback(
    async (newStatus?: "draft" | "published" | "archived") => {
      if (!title.trim()) {
        toast.error("Please add a title")
        titleRef.current?.focus()
        return
      }

      if (!entryId) return

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

        const res = await client.changelog.entriesUpdate.$post({
          slug,
          entryId,
          title: title.trim(),
          content: { type: content.type || "doc", content: content.content },
          summary: summary || null,
          coverImage: coverImage || null,
          status: newStatus || status,
        })
        const data = await res.json()

        if ((data as any).ok) {
          toast.success("Saved!")
          if (newStatus) setStatus(newStatus)
        } else {
          toast.error("Failed to save")
        }
      } catch (err) {
        toast.error("Failed to save")
      } finally {
        setSaving(false)
      }
    },
    [slug, entryId, title, coverImage, status]
  )

  const handleDelete = useCallback(async () => {
    if (!entryId) return

    const confirmed = window.confirm(
      "Are you sure you want to delete this entry? This cannot be undone."
    )
    if (!confirmed) return

    setSaving(true)
    try {
      const res = await client.changelog.entriesDelete.$post({ slug, entryId })
      const data = await res.json()

      if ((data as any).ok) {
        toast.success("Entry deleted")
        router.push(`/workspaces/${slug}/changelog`)
      } else {
        toast.error("Failed to delete")
      }
    } catch (err) {
      toast.error("Failed to delete")
    } finally {
      setSaving(false)
    }
  }, [slug, entryId, router])

  if (loading) {
    return (
      <>
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="py-3 flex items-center justify-between">
            <Skeleton className="h-8 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
        <div className="py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    )
  }

  return (
    <>
      {/* Floating header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            <Badge
              variant="outline"
              className={cn(
                status === "published" && "border-emerald-500/50 text-emerald-500",
                status === "draft" && "border-amber-500/50 text-amber-500",
                status === "archived" && "border-muted-foreground/50 text-muted-foreground"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={saving}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving}
            >
              Save
            </Button>
            {status !== "published" && (
              <Button
                size="sm"
                onClick={() => handleSave("published")}
                disabled={saving}
              >
                {saving ? "Publishing..." : "Publish"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="py-8">
        {/* Cover image */}
        {coverImage ? (
          <div className="relative mb-8 group">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-[280px] object-cover rounded-lg"
            />
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
        <textarea
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
          className={cn(
            "w-full text-4xl font-bold tracking-tight bg-transparent border-none outline-none resize-none",
            "placeholder:text-muted-foreground/40",
            "mb-4"
          )}
          rows={1}
        />

        {/* Date indicator */}
        <div className="text-sm text-muted-foreground mb-8">
          {publishedAt
            ? `Published ${new Date(publishedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`
            : new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
        </div>

        {/* Content editor */}
        {initialContent && (
          <NotionEditor ref={editorRef} initialContent={initialContent} />
        )}
      </div>
    </>
  )
}
