"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { TagIcon } from "@feedgot/ui/icons/tag"
import { cn } from "@feedgot/ui/lib/utils"
import { client } from "@feedgot/api/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useFilterPopover } from "@/lib/filter-store"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { parseArrayParam, buildRequestsUrl, toggleValue, isAllSelected as isAllSel } from "@/utils/request-filters"

export default function TagsAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = useFilterPopover("tags")
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["tags", getSlugFromPath(pathname)],
    queryFn: async () => {
      const res = await client.board.tagsByWorkspaceSlug.$get({ slug })
      const data = await res.json()
      const tags = (data?.tags || [])
      return tags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color, count: t.count }))
    },
    staleTime: 300_000,
    gcTime: 300_000,
    enabled: !!getSlugFromPath(pathname),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const selected = React.useMemo(() => parseArrayParam(sp.get("tag")), [sp])
  const isAllSelected = React.useMemo(() => isAllSel(items.map((i: { slug: string }) => i.slug), selected), [items, selected])

  React.useEffect(() => {
    if (open) {
      queryClient.prefetchQuery({
        queryKey: ["tags", getSlugFromPath(pathname)],
        queryFn: async () => {
          const res = await client.board.tagsByWorkspaceSlug.$get({ slug: getSlugFromPath(pathname) })
          const data = await res.json()
          const tags = (data?.tags || [])
          return tags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color, count: t.count }))
        },
        staleTime: 300_000,
        gcTime: 300_000,
      })
    }
  }, [open, pathname, queryClient, slug])

  const toggle = (tagSlug: string) => {
    const next = toggleValue(selected, tagSlug)
    if (next.length === 0) {
      const href = workspaceBase(slug)
      React.startTransition(() => {
        router.replace(href, { scroll: false })
      })
      return
    }
    const href = buildRequestsUrl(slug, sp, { tag: next })
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
    const href = buildRequestsUrl(slug, sp, { tag: next })
    React.startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("rounded-md border bg-card px-2 py-2 cursor-pointer", className)} aria-label="Tags">
          <TagIcon className="w-4 h-4" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        {isLoading ? (
          <div className="p-3 text-sm text-accent">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-accent">No tags</div>
        ) : (
          <PopoverList>
            {items.map((it: { id: string; name: string; slug: string; color?: string; count?: number }) => (
              <PopoverListItem
                key={it.id}
                role="menuitemcheckbox"
                aria-checked={selected.includes(it.slug)}
                onClick={() => toggle(it.slug)}
              >
                <span className="text-sm truncate">{it.name}</span>
                {typeof it.count === "number" ? <span className="ml-auto text-xs text-accent tabular-nums">{it.count}</span> : null}
                {selected.includes(it.slug) ? <span className="ml-1 text-xs">✓</span> : null}
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
