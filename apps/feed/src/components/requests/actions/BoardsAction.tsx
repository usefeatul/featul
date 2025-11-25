"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { LayersIcon } from "@feedgot/ui/icons/layers"
import { cn } from "@feedgot/ui/lib/utils"
import { client } from "@feedgot/api/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { getSlugFromPath } from "@/config/nav"
import { parseArrayParam, buildRequestsUrl, toggleValue, isAllSelected as isAllSel } from "@/utils/request-filters"

export default function BoardsAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<Array<{ id: string; name: string; slug: string }>>([])

  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const selected = React.useMemo(() => parseArrayParam(sp.get("board")), [sp])
  const isAllSelected = React.useMemo(() => isAllSel(items.map((i) => i.slug), selected), [items, selected])

  React.useEffect(() => {
    let mounted = true
    void (async () => {
      setLoading(true)
      try {
        const res = await client.board.byWorkspaceSlug.$get({ slug })
        const data = await res.json()
        const boards = (data?.boards || []).filter((b: any) => b?.slug !== "roadmap" && b?.slug !== "changelog")
        if (mounted) setItems(boards.map((b: any) => ({ id: b.id, name: b.name, slug: b.slug })))
      } catch {}
      finally { if (mounted) setLoading(false) }
    })()
    return () => { mounted = false }
  }, [slug])

  const toggle = (slugItem: string) => {
    const next = toggleValue(selected, slugItem)
    const href = buildRequestsUrl(slug, sp, { board: next })
    router.push(href)
  }

  const selectAll = () => {
    const next = isAllSelected ? [] : items.map((i) => i.slug)
    const href = buildRequestsUrl(slug, sp, { board: next })
    router.push(href)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("rounded-md border bg-card px-2 py-1", className)} aria-label="Boards">
          <LayersIcon className="w-4 h-4" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        {loading ? (
          <div className="p-3 text-sm text-accent">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-accent">No boards</div>
        ) : (
          <PopoverList>
            {items.map((it) => (
              <PopoverListItem key={it.id} onClick={() => toggle(it.slug)}>
                <span className="text-sm truncate">{it.name}</span>
                {selected.includes(it.slug) ? <span className="ml-auto text-xs">✓</span> : null}
              </PopoverListItem>
            ))}
            <PopoverListItem onClick={selectAll}>
              <span className="text-sm">Select all</span>
              {isAllSelected ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          </PopoverList>
        )}
      </PopoverContent>
    </Popover>
  )
}
