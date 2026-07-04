"use client"

import React from "react"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { TrashIcon } from "@featul/ui/icons/trash"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import { LayersIcon } from "@featul/ui/icons/layers"
import { TagIcon } from "@featul/ui/icons/tag"
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar"

import { cn } from "@featul/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { client } from "@featul/api/client"
import { Button } from "@featul/ui/components/button"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { buildRequestsUrl } from "@/utils/request"
import { useFilterBarVisibility } from "@/hooks/useFilterBarVisibility"
import { parseRequestFiltersFromSearchParams } from "@/utils/request-filters"
import StatusIcon from "./StatusIcon"

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Review", value: "review" },
  { label: "Planned", value: "planned" },
  { label: "Progress", value: "progress" },
  { label: "Complete", value: "completed" },
  { label: "Closed", value: "closed" },
]

function FilterSummarySeparator() {
  return <ToolbarSeparator className="self-stretch bg-border" />
}

function FilterSummaryItem({
  icon,
  label,
  ariaLabel,
  onRemove,
}: {
  icon?: React.ReactNode
  label: string
  ariaLabel: string
  onRemove: () => void
}) {
  return (
    <Button
      type="button"
      onClick={onRemove}
      variant="card"
      className="h-8 rounded-none border-0 bg-card px-3 text-xs font-medium text-foreground shadow-none ring-0 ring-offset-0 hover:bg-muted/40 focus-visible:ring-0 focus-visible:ring-offset-0"
      aria-label={ariaLabel}
    >
      <span className="flex min-w-0 items-center">
        {icon}
        <span className={cn("truncate", icon ? "ml-1" : "")}>{label}</span>
      </span>
      <XMarkIcon className="ml-3 size-3.5 shrink-0 text-muted-foreground opacity-70" />
    </Button>
  )
}

export default function FilterSummary({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const router = useRouter()
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const { status, board: boards, tag: tags, order } = React.useMemo(
    () => parseRequestFiltersFromSearchParams(sp),
    [sp]
  )
  const count = status.length + boards.length + tags.length + (order === "oldest" ? 1 : 0)
  const hasAnyFilters = count > 0
  const { isVisible, handleClearAll } = useFilterBarVisibility({
    hasAnyFilters,
    buildClearAllHref: () => workspaceBase(slug),
  })

  const { data: boardsBySlug = {} } = useQuery({
    queryKey: ["boards-map", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug })
      const data = await res.json()
      const boardsArr = (data?.boards || []).filter((b: { slug: string; name?: string | null }) => b?.slug !== "roadmap" && b?.slug !== "changelog")
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
  const activeFilters: React.ReactNode[] = []

  status.forEach((s) => {
    activeFilters.push(
      <FilterSummaryItem
        key={`status-${s}`}
        icon={<StatusIcon status={s} className="size-3.5 shrink-0" />}
        label={statusLabel(s)}
        ariaLabel={`Remove status ${statusLabel(s)}`}
        onRemove={() => removeStatus(s)}
      />
    )
  })

  boards.forEach((b) => {
    activeFilters.push(
      <FilterSummaryItem
        key={`board-${b}`}
        icon={<LayersIcon className="size-3.5 shrink-0 opacity-70" size={14} />}
        label={boardsBySlug[b] || b}
        ariaLabel={`Remove board ${boardsBySlug[b] || b}`}
        onRemove={() => removeBoard(b)}
      />
    )
  })

  tags.forEach((t) => {
    activeFilters.push(
      <FilterSummaryItem
        key={`tag-${t}`}
        icon={<TagIcon className="size-3.5 shrink-0 opacity-70" size={14} />}
        label={tagsBySlug[t] || t}
        ariaLabel={`Remove tag ${tagsBySlug[t] || t}`}
        onRemove={() => removeTag(t)}
      />
    )
  })

  if (order === "oldest") {
    activeFilters.push(
      <FilterSummaryItem
        key="order-oldest"
        label="Oldest first"
        ariaLabel="Remove sort oldest"
        onRemove={removeOrder}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex justify-start pointer-events-none",
        className
      )}
      aria-label="Active filters"
    >
      {isVisible ? (
        <Toolbar
          key="filter-summary-bar"
          size="sm"
          variant="plain"
          className="pointer-events-auto flex max-w-full items-center overflow-hidden h-8 border-border bg-card shadow-none ring-0 ring-offset-0 px-0 py-0"
        >
          <div className="flex items-center gap-0 overflow-x-auto px-0 py-0 flex-1 scrollbar-hide h-full">
            {activeFilters.map((el, i) => (
              <React.Fragment key={i}>
                {i > 0 && <FilterSummarySeparator />}
                {el}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center shrink-0 h-full">
            <FilterSummarySeparator />
            <Button
              type="button"
              onClick={handleClearAll}
              variant="ghost"
              className="h-8 w-8 rounded-none border-0 bg-card px-0 shadow-none ring-0 ring-offset-0 hover:bg-muted/40 text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Clear all filters"
            >
              <span>
                <TrashIcon className="size-4 opacity-70" />
              </span>
            </Button>
          </div>
        </Toolbar>
      ) : null}
    </div>
  )
}
