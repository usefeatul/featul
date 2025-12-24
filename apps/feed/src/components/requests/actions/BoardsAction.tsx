"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { LayersIcon } from "@oreilla/ui/icons/layers"
import { cn } from "@oreilla/ui/lib/utils"
import { client } from "@oreilla/api/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useFilterPopover } from "@/lib/filter-store"
import { useQuery } from "@tanstack/react-query"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { parseArrayParam, buildRequestsUrl, toggleValue, isAllSelected as isAllSel } from "@/utils/request-filters"

export default function BoardsAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = useFilterPopover("boards")


  const { data: items = [], isLoading } = useQuery({
    queryKey: ["boards", getSlugFromPath(pathname)],
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug: getSlugFromPath(pathname) })
      const data = await res.json()
      const boards = (data?.boards || []).filter((b: any) => b?.slug !== "roadmap" && b?.slug !== "changelog")
      return boards.map((b: any) => ({ id: b.id, name: b.name, slug: b.slug }))
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const selected = React.useMemo(() => parseArrayParam(sp.get("board")), [sp])
  const isAllSelected = React.useMemo(() => isAllSel(items.map((i: { slug: string }) => i.slug), selected), [items, selected])

  React.useEffect(() => {}, [slug])

  const toggle = (slugItem: string) => {
    const next = toggleValue(selected, slugItem)
    if (next.length === 0) {
      const href = workspaceBase(slug)
      React.startTransition(() => {
        router.replace(href, { scroll: false })
      })
      return
    }
    const href = buildRequestsUrl(slug, sp, { board: next })
    React.startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  const selectAll = () => {
    if (isAllSelected) {
      const href = workspaceBase(slug)
      React.startTransition(() => {
        router.replace(href, { scroll: false })
      })
      return
    }
    const next = items.map((i: { slug: string }) => i.slug)
    const href = buildRequestsUrl(slug, sp, { board: next })
    React.startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("rounded-sm dark:bg-black/40 border bg-card px-2 py-2 cursor-pointer", className)} aria-label="Boards">
          <LayersIcon className="w-4 h-4" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        {isLoading ? (
          <div className="p-3 text-sm text-accent">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-accent">No boards</div>
        ) : (
          <PopoverList>
            {items.map((it: { id: string; name: string; slug: string }) => (
              <PopoverListItem
                key={it.id}
                role="menuitemcheckbox"
                aria-checked={selected.includes(it.slug)}
                onClick={() => toggle(it.slug)}
              >
                <span className="text-sm truncate">{it.name}</span>
                {selected.includes(it.slug) ? <span className="ml-auto text-xs">✓</span> : null}
              </PopoverListItem>
            ))}
            <PopoverListItem onClick={selectAll} role="menuitemcheckbox" aria-checked={isAllSelected}>
              <span className="text-sm">Select all</span>
              {isAllSelected ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          </PopoverList>
        )}
      </PopoverContent>
    </Popover>
  )
}
