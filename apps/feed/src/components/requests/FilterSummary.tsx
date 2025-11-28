"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { XMarkIcon } from "@feedgot/ui/icons/xmark"
import { cn } from "@feedgot/ui/lib/utils"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { parseArrayParam } from "@/utils/request-filters"

export default function FilterSummary({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const router = useRouter()
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const status = React.useMemo(() => parseArrayParam(sp.get("status")), [sp])
  const boards = React.useMemo(() => parseArrayParam(sp.get("board")), [sp])
  const tags = React.useMemo(() => parseArrayParam(sp.get("tag")), [sp])
  const order = React.useMemo(() => (sp.get("order") || "newest").toLowerCase(), [sp])
  const count = status.length + boards.length + tags.length + (order === "oldest" ? 1 : 0)

  if (count === 0) return null

  const clearAll = () => {
    const href = workspaceBase(slug)
    React.startTransition(() => router.replace(href, { scroll: false }))
  }

  return (
    <button type="button" onClick={clearAll} className={cn("relative group inline-flex items-center justify-center h-8 min-w-[32px] rounded-md bg-muted px-3 text-xs text-foreground cursor-pointer", className)} aria-label="Clear filters">
      <span className="pointer-events-none">{count} filters</span>
      <XMarkIcon className="absolute -top-1 -right-1 size-3 opacity-0 group-hover:opacity-100 transition-opacity bg-card text-black rounded-md p-0.5" />
    </button>
  )
}
