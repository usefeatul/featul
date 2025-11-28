"use client"

import React from "react"
import { cn } from "@feedgot/ui/lib/utils"
import { usePathname, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { client } from "@feedgot/api/client"
import { parseArrayParam } from "@/utils/request-filters"
import { getSlugFromPath } from "@/config/nav"

export default function PostCountBadge({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const statuses = parseArrayParam(sp.get("status"))
  const boards = parseArrayParam(sp.get("board"))
  const tags = parseArrayParam(sp.get("tag"))
  const search = sp.get("search") || ""

  const { data: count = 0, isFetching } = useQuery({
    queryKey: ["post-count", slug, statuses, boards, tags, search],
    enabled: !!slug,
    queryFn: async () => {
      const res = await client.board.postCountByWorkspaceSlug.$get({
        slug,
        statuses,
        boardSlugs: boards,
        tagSlugs: tags,
        search,
      })
      const data = await res.json()
      return Number(data?.count || 0)
    },
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  if (count <= 0 && !isFetching) return null

  return (
    <span className={cn("inline-flex items-center gap-1 bg-muted rounded-full ring-1 ring-border px-2 py-1 text-xs tabular-nums", className)} aria-live="polite">
      {isFetching ? "…" : count} {isFetching ? "" : count === 1 ? "Post" : "Posts"}
    </span>
  )
}
