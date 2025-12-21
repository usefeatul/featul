"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { TrashIcon } from "@oreilla/ui/icons/trash"
import { XMarkIcon } from "@oreilla/ui/icons/xmark"

import { cn } from "@oreilla/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import { Button } from "@oreilla/ui/components/button"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { parseArrayParam, buildRequestsUrl } from "@/utils/request-filters"

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Review", value: "review" },
  { label: "Planned", value: "planned" },
  { label: "Progress", value: "progress" },
  { label: "Complete", value: "completed" },
  { label: "Closed", value: "closed" },
]

export default function FilterSummary({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const router = useRouter()
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const status = React.useMemo(() => parseArrayParam(sp.get("status")).map((s) => String(s).toLowerCase()), [sp])
  const boards = React.useMemo(() => parseArrayParam(sp.get("board")), [sp])
  const tags = React.useMemo(() => parseArrayParam(sp.get("tag")), [sp])
  const order = React.useMemo(() => (sp.get("order") || "newest").toLowerCase(), [sp])
  const count = status.length + boards.length + tags.length + (order === "oldest" ? 1 : 0)

  const { data: boardsBySlug = {} } = useQuery({
    queryKey: ["boards-map", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug })
      const data = await res.json()
      const boardsArr = (data?.boards || []).filter((b: any) => b?.slug !== "roadmap" && b?.slug !== "changelog")
      const map: Record<string, string> = {}
      for (const b of boardsArr) map[String(b.slug)] = String(b.name || b.slug)
      return map
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const { data: tagsBySlug = {} } = useQuery({
    queryKey: ["tags-map", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug })
      const data = await res.json()
      const tagsArr = (data?.tags || [])
      const map: Record<string, string> = {}
      for (const t of tagsArr) map[String(t.slug)] = String(t.name || t.slug)
      return map
    },
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (count === 0) return null

  const clearAll = () => {
    const href = workspaceBase(slug)
    React.startTransition(() => router.replace(href, { scroll: false }))
  }

  const removeStatus = (v: string) => {
    const next = status.filter((s) => s !== v)
    const hasOthers = boards.length + tags.length + (order === "oldest" ? 1 : 0) > 0
    if (next.length === 0 && !hasOthers) {
      clearAll()
      return
    }
    const href = buildRequestsUrl(slug, sp, { status: next })
    React.startTransition(() => router.push(href, { scroll: false }))
  }

  const removeBoard = (v: string) => {
    const next = boards.filter((b) => b !== v)
    const hasOthers = status.length + tags.length + (order === "oldest" ? 1 : 0) > 0
    if (next.length === 0 && !hasOthers) {
      clearAll()
      return
    }
    const href = buildRequestsUrl(slug, sp, { board: next })
    React.startTransition(() => router.push(href, { scroll: false }))
  }

  const removeTag = (v: string) => {
    const next = tags.filter((t) => t !== v)
    const hasOthers = status.length + boards.length + (order === "oldest" ? 1 : 0) > 0
    if (next.length === 0 && !hasOthers) {
      clearAll()
      return
    }
    const href = buildRequestsUrl(slug, sp, { tag: next })
    React.startTransition(() => router.push(href, { scroll: false }))
  }

  const removeOrder = () => {
    const hasOthers = status.length + boards.length + tags.length > 0
    if (!hasOthers) {
      clearAll()
      return
    }
    const href = buildRequestsUrl(slug, sp, { order: "newest" })
    React.startTransition(() => router.push(href, { scroll: false }))
  }

  const statusLabel = (v: string) => {
    const found = STATUS_OPTIONS.find((s) => s.value === v)
    return found ? found.label : v
  }

  return (
    <div
      className={cn(
        "fixed top-0 inset-x-0 z-40 flex justify-center px-3 pointer-events-none",
        className
      )}
      aria-label="Active filters"
    >
      <div className="bg-card pointer-events-auto mx-auto flex max-w-[90vw] items-center gap-1   border-t-transparent overflow-hidden rounded-xs  px-2 py-1 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center gap-1 overflow-x-auto px-0.5 py-0.5 flex-1 scrollbar-hide">
          {status.map((s) => (
            <Button
              key={`status-${s}`}
              type="button"
              onClick={() => removeStatus(s)}
              variant="nav"
              size="xs"
              aria-label={`Remove status ${statusLabel(s)}`}
            >
              <span className="truncate">{statusLabel(s)}</span>
              <XMarkIcon className="ml-1 size-3 opacity-60" />
            </Button>
          ))}
          {boards.map((b) => (
            <Button
              key={`board-${b}`}
              type="button"
              onClick={() => removeBoard(b)}
              variant="nav"
              size="xs"
              aria-label={`Remove board ${boardsBySlug[b] || b}`}
            >
              <span className="truncate">{boardsBySlug[b] || b}</span>
              <XMarkIcon className="ml-1 size-3 opacity-60" />
            </Button>
          ))}
          {tags.map((t) => (
            <Button
              key={`tag-${t}`}
              type="button"
              onClick={() => removeTag(t)}
              variant="nav"
              size="xs"
              aria-label={`Remove tag ${tagsBySlug[t] || t}`}
            >
              <span className="truncate">{tagsBySlug[t] || t}</span>
              <XMarkIcon className="ml-1 size-3 opacity-60" />
            </Button>
          ))}
          {order === "oldest" ? (
            <Button
              type="button"
              onClick={removeOrder}
              variant="nav"
              size="xs"
              aria-label="Remove sort oldest"
            >
              <span className="truncate">Oldest first</span>
              <XMarkIcon className="ml-1 size-3" />
            </Button>
          ) : null}
        </div>

        <div className="flex items-center shrink-0 gap-1">
          <div className="h-5 w-px bg-border/70" />
          <Button
            type="button"
            onClick={clearAll}
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Clear all filters"
          >
            <TrashIcon className="size-4 opacity-70" />
          </Button>
        </div>
      </div>
    </div>
  )
}
