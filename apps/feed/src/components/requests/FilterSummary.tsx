"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { TrashIcon } from "@oreilla/ui/icons/trash"
import { XMarkIcon } from "@oreilla/ui/icons/xmark"

import { cn } from "@oreilla/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
import { Button } from "@oreilla/ui/components/button"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { parseArrayParam, buildRequestsUrl } from "@/utils/request-filters"
import { useFilterBarVisibility } from "@/hooks/useFilterBarVisibility"

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
  const hasAnyFilters = count > 0
  const { isVisible, handleClearAll, handleBarExitComplete } = useFilterBarVisibility({
    hasAnyFilters,
    buildClearAllHref: () => workspaceBase(slug),
  })

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

  const removeStatus = (v: string) => {
    const next = status.filter((s) => s !== v)
    const hasOthers = boards.length + tags.length + (order === "oldest" ? 1 : 0) > 0
    if (next.length === 0 && !hasOthers) {
      handleClearAll()
      return
    }
    const href = buildRequestsUrl(slug, sp, { status: next })
    React.startTransition(() => router.push(href, { scroll: false }))
  }

  const removeBoard = (v: string) => {
    const next = boards.filter((b) => b !== v)
    const hasOthers = status.length + tags.length + (order === "oldest" ? 1 : 0) > 0
    if (next.length === 0 && !hasOthers) {
      handleClearAll()
      return
    }
    const href = buildRequestsUrl(slug, sp, { board: next })
    React.startTransition(() => router.push(href, { scroll: false }))
  }

  const removeTag = (v: string) => {
    const next = tags.filter((t) => t !== v)
    const hasOthers = status.length + boards.length + (order === "oldest" ? 1 : 0) > 0
    if (next.length === 0 && !hasOthers) {
      handleClearAll()
      return
    }
    const href = buildRequestsUrl(slug, sp, { tag: next })
    React.startTransition(() => router.push(href, { scroll: false }))
  }

  const removeOrder = () => {
    const hasOthers = status.length + boards.length + tags.length > 0
    if (!hasOthers) {
      handleClearAll()
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
      <AnimatePresence
        initial={false}
        onExitComplete={handleBarExitComplete}
      >
        {isVisible ? (
          <motion.div
            key="filter-summary-bar"
            className="bg-card pointer-events-auto mx-auto flex max-w-[90vw] items-center gap-1 border border-border  border-t-transparent overflow-hidden rounded-xs  px-1.5 py-0.5 shadow-sm  backdrop-blur supports-backdrop-filter:bg-background"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
        <div className="flex items-center gap-1 overflow-x-auto px-0.5 py-0.5 flex-1 scrollbar-hide">
          <AnimatePresence initial={false} mode="popLayout">
            {status.map((s) => (
              <motion.div
                key={`status-${s}`}
                layout="position"
                initial={{ opacity: 0, y: 3, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -3, scale: 0.94 }}
                transition={{
                  duration: 0.18,
                  layout: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="button"
                  onClick={() => removeStatus(s)}
                  variant="nav"
                  size="xs"
                  aria-label={`Remove status ${statusLabel(s)}`}
                >
                  <span className="truncate">{statusLabel(s)}</span>
                  <XMarkIcon className="ml-1 size-3 opacity-60" />
                </Button>
              </motion.div>
            ))}
            {boards.map((b) => (
              <motion.div
                key={`board-${b}`}
                layout="position"
                initial={{ opacity: 0, y: 3, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -3, scale: 0.94 }}
                transition={{
                  duration: 0.18,
                  layout: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="button"
                  onClick={() => removeBoard(b)}
                  variant="nav"
                  size="xs"
                  aria-label={`Remove board ${boardsBySlug[b] || b}`}
                >
                  <span className="truncate">{boardsBySlug[b] || b}</span>
                  <XMarkIcon className="ml-1 size-3 opacity-60" />
                </Button>
              </motion.div>
            ))}
            {tags.map((t) => (
              <motion.div
                key={`tag-${t}`}
                layout="position"
                initial={{ opacity: 0, y: 3, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -3, scale: 0.94 }}
                transition={{
                  duration: 0.18,
                  layout: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  type="button"
                  onClick={() => removeTag(t)}
                  variant="nav"
                  size="xs"
                  aria-label={`Remove tag ${tagsBySlug[t] || t}`}
                >
                  <span className="truncate">{tagsBySlug[t] || t}</span>
                  <XMarkIcon className="ml-1 size-3 opacity-60" />
                </Button>
              </motion.div>
            ))}
            {order === "oldest" ? (
              <motion.div
                key="order-oldest"
                layout="position"
                initial={{ opacity: 0, y: 3, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -3, scale: 0.94 }}
                transition={{
                  duration: 0.18,
                  layout: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
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
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center shrink-0 gap-1">
          <div className="h-5 w-px bg-border/70" />
          <Button
            type="button"
            onClick={handleClearAll}
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Clear all filters"
          >
            <motion.span
              whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.35 }}
            >
              <TrashIcon className="size-4 opacity-70" />
            </motion.span>
          </Button>
        </div>
      </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
