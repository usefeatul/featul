"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { LayersIcon } from "@featul/ui/icons/layers"
import { Button } from "@featul/ui/components/button"
import { client } from "@featul/api/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useFilterPopover } from "@/lib/filter-store"
import { useQuery } from "@tanstack/react-query"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { buildRequestsUrl, toggleValue, isAllSelected as isAllSel } from "@/utils/request"
import { parseRequestFiltersFromSearchParams } from "@/utils/request-filters"

type BoardItem = {
  id: string
  name: string
  slug: string
}

type BoardsResponse = {
  boards?: Array<{
    id?: string
    name?: string
    slug?: string
  }>
}

export default function BoardsAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = useFilterPopover("boards")
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])


  const { data: items = [], isLoading } = useQuery({
    queryKey: ["boards", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const res = await client.board.byWorkspaceSlug.$get({ slug })
      const data = (await res.json().catch(() => null)) as BoardsResponse | null
      const boards = (Array.isArray(data?.boards) ? data.boards : []).filter(
        (board): board is Required<Pick<BoardItem, "id" | "name" | "slug">> =>
          typeof board?.id === "string" &&
          typeof board?.name === "string" &&
          typeof board?.slug === "string" &&
          board.slug !== "roadmap" &&
          board.slug !== "changelog"
      )
      return boards.map((board): BoardItem => ({
        id: board.id,
        name: board.name,
        slug: board.slug,
      }))
    },
    staleTime: 300_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const selected = React.useMemo(
    () => parseRequestFiltersFromSearchParams(sp).board,
    [sp]
  )
  const isAllSelected = React.useMemo(() => isAllSel(items.map((i) => i.slug), selected), [items, selected])

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
    const next = items.map((i) => i.slug)
    const href = buildRequestsUrl(slug, sp, { board: next })
    React.startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="card"
          size="icon-sm"
          aria-label="Boards"
          className={className}
        >
          <LayersIcon className="w-4 h-4" size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        {isLoading ? (
          <div className="p-3 text-sm text-accent">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-accent">No boards</div>
        ) : (
          <PopoverList>
            {items.map((it) => (
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
