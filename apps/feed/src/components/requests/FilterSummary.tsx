"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CloseIcon } from "@feedgot/ui/icons/close"
import { cn } from "@feedgot/ui/lib/utils"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { parseArrayParam, buildRequestsUrl } from "@/utils/request-filters"

export default function FilterSummary({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const router = useRouter()
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const status = React.useMemo(() => parseArrayParam(sp.get("status")), [sp])
  const boards = React.useMemo(() => parseArrayParam(sp.get("board")), [sp])
  const tags = React.useMemo(() => parseArrayParam(sp.get("tag")), [sp])
  const count = status.length + boards.length + tags.length

  if (count === 0) return null

  const clearAll = () => {
    router.push(workspaceBase(slug))
  }

  return (
    <button type="button" onClick={clearAll} className={cn("relative group rounded-md bg-muted px-2 py-0.5 text-xs text-foreground", className)} aria-label="Clear filters">
      <span className="pointer-events-none">{count} filters</span>
      <CloseIcon className="absolute -top-1 -right-1 size-3 opacity-0 group-hover:opacity-100 transition-opacity bg-card text-black rounded-sm p-0.5" />
    </button>
  )
}
