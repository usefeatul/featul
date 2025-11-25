"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { TagIcon } from "@feedgot/ui/icons/tag"
import { cn } from "@feedgot/ui/lib/utils"
import { client } from "@feedgot/api/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

function parseArrayParam(v: string | null): string[] {
  try {
    if (!v) return []
    const arr = JSON.parse(v)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function enc(arr: string[]) {
  return encodeURIComponent(JSON.stringify(arr))
}

export default function TagsAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<Array<{ id: string; name: string; slug: string; color?: string; count?: number }>>([])

  const slug = React.useMemo(() => {
    const parts = pathname.split("/")
    return parts[2] || ""
  }, [pathname])

  const selected = React.useMemo(() => parseArrayParam(sp.get("tag")), [sp])
  const isAllSelected = React.useMemo(() => items.length > 0 && selected.length === items.length, [items, selected])

  React.useEffect(() => {
    let mounted = true
    void (async () => {
      setLoading(true)
      try {
        const res = await client.board.tagsByWorkspaceSlug.$get({ slug })
        const data = await res.json()
        const tags = (data?.tags || [])
        if (mounted) setItems(tags.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug, color: t.color, count: t.count })))
      } catch {}
      finally { if (mounted) setLoading(false) }
    })()
    return () => { mounted = false }
  }, [slug])

  const toggle = (tagSlug: string) => {
    const next = selected.includes(tagSlug) ? selected.filter((s) => s !== tagSlug) : [...selected, tagSlug]
    const status = sp.get("status") || encodeURIComponent(JSON.stringify([]))
    const boards = sp.get("board") || encodeURIComponent(JSON.stringify([]))
    const order = sp.get("order") || "newest"
    const search = sp.get("search") || ""
    const href = `/workspaces/${slug}/requests?status=${status}&board=${boards}&tag=${enc(next)}&order=${order}&search=${search}`
    router.push(href)
  }

  const selectAll = () => {
    const next = isAllSelected ? [] : items.map((i) => i.slug)
    const status = sp.get("status") || encodeURIComponent(JSON.stringify([]))
    const boards = sp.get("board") || encodeURIComponent(JSON.stringify([]))
    const order = sp.get("order") || "newest"
    const search = sp.get("search") || ""
    const href = `/workspaces/${slug}/requests?status=${status}&board=${boards}&tag=${enc(next)}&order=${order}&search=${search}`
    router.push(href)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("rounded-md border bg-card px-2 py-1", className)} aria-label="Tags">
          <TagIcon className="w-4 h-4" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        {loading ? (
          <div className="p-3 text-sm text-accent">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-accent">No tags</div>
        ) : (
          <PopoverList>
            <PopoverListItem onClick={selectAll}>
              <span className="text-sm">Select all</span>
              {isAllSelected ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
            {items.map((it) => (
              <PopoverListItem key={it.id} onClick={() => toggle(it.slug)}>
                <span className="text-sm truncate">{it.name}</span>
                {typeof it.count === "number" ? <span className="ml-auto text-xs text-accent tabular-nums">{it.count}</span> : null}
                {selected.includes(it.slug) ? <span className="ml-1 text-xs">✓</span> : null}
              </PopoverListItem>
            ))}
          </PopoverList>
        )}
      </PopoverContent>
    </Popover>
  )
}
