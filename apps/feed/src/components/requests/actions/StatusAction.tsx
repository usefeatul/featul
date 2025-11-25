"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { ListFilterIcon } from "@feedgot/ui/icons/list-filter"
import { cn } from "@feedgot/ui/lib/utils"
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

const options = [
  { label: "Pending", value: "pending" },
  { label: "Review", value: "under-review" },
  { label: "Planned", value: "planned" },
  { label: "Progress", value: "in-progress" },
  { label: "Complete", value: "completed" },
  { label: "Closed", value: "closed" },
]

export default function StatusAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const slug = React.useMemo(() => {
    const parts = pathname.split("/")
    return parts[2] || ""
  }, [pathname])

  const selected = React.useMemo(() => parseArrayParam(sp.get("status")).map((s) => String(s).toLowerCase()), [sp])
  const allValues = React.useMemo(() => options.map((o) => o.value), [])
  const isAllSelected = React.useMemo(() => selected.length === allValues.length && allValues.length > 0, [selected, allValues])

  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]
    const boards = sp.get("board") || encodeURIComponent(JSON.stringify([]))
    const tags = sp.get("tag") || encodeURIComponent(JSON.stringify([]))
    const order = sp.get("order") || "newest"
    const search = sp.get("search") || ""
    const href = `/workspaces/${slug}/requests?status=${enc(next)}&board=${boards}&tag=${tags}&order=${order}&search=${search}`
    router.push(href)
  }

  const selectAll = () => {
    const next = isAllSelected ? [] : allValues
    const boards = sp.get("board") || encodeURIComponent(JSON.stringify([]))
    const tags = sp.get("tag") || encodeURIComponent(JSON.stringify([]))
    const order = sp.get("order") || "newest"
    const search = sp.get("search") || ""
    const href = `/workspaces/${slug}/requests?status=${enc(next)}&board=${boards}&tag=${tags}&order=${order}&search=${search}`
    router.push(href)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("rounded-md border bg-card px-2 py-1", className)} aria-label="Requests">
          <ListFilterIcon className="w-4 h-4" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          <PopoverListItem onClick={selectAll}>
            <span className="text-sm">Select all</span>
            {isAllSelected ? <span className="ml-auto text-xs">✓</span> : null}
          </PopoverListItem>
          {options.map((opt) => (
            <PopoverListItem key={opt.value} onClick={() => toggle(opt.value)}>
              <span className="text-sm">{opt.label}</span>
              {selected.includes(opt.value) ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
