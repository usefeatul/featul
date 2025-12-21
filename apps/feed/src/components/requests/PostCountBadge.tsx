"use client"

import React from "react"
import { cn } from "@oreilla/ui/lib/utils"
import { usePathname, useSearchParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { client } from "@oreilla/api/client"
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

  const queryClient = useQueryClient()
  const queryKey: (string | string[])[] = ["post-count", slug, statuses, boards, tags, search]
  const seeded = queryClient.getQueryData<number>(queryKey as any)

  const { data: count = seeded ?? 0 } = useQuery<number, Error, number, (string | string[])[]>({
    queryKey,
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
    ...(seeded !== undefined ? { initialData: seeded } : {}),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  })

  if (count <= 0) return null

  return (
    <span className={cn("inline-flex items-center gap-1 bg-muted rounded-md  ring-1 ring-border px-2 py-2 text-xs tabular-nums text-accent", className)} aria-live="polite">
      {count} {count === 1 ? "Post" : "Posts"}
    </span>
  )
}
