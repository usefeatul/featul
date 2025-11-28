"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { ListFilterIcon } from "@feedgot/ui/icons/list-filter"
import { cn } from "@feedgot/ui/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useFilterPopover } from "@/lib/filter-store"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import { parseArrayParam, buildRequestsUrl, toggleValue, isAllSelected as isAllSel } from "@/utils/request-filters"

const options = [
  { label: "Pending", value: "pending" },
  { label: "Review", value: "review" },
  { label: "Planned", value: "planned" },
  { label: "Progress", value: "progress" },
  { label: "Complete", value: "completed" },
  { label: "Closed", value: "closed" },
]

export default function StatusAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = useFilterPopover("status")

  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const selected = React.useMemo(() => parseArrayParam(sp.get("status")).map((s) => String(s).toLowerCase()), [sp])
  const allValues = React.useMemo(() => options.map((o) => o.value), [])
  const isAllSelected = React.useMemo(() => isAllSel(allValues, selected), [selected, allValues])

  const toggle = (v: string) => {
    const next = toggleValue(selected, v)
    if (next.length === 0) {
      const href = workspaceBase(slug)
      React.startTransition(() => {
        router.replace(href, { scroll: false })
      })
      return
    }
    const href = buildRequestsUrl(slug, sp, { status: next })
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
    const next = allValues
    const href = buildRequestsUrl(slug, sp, { status: next })
    React.startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("rounded-md border bg-card px-2 py-2 cursor-pointer", className)} aria-label="Requests">
          <ListFilterIcon className="w-4 h-4" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {options.map((opt) => (
            <PopoverListItem
              key={opt.value}
              onClick={() => toggle(opt.value)}
            >
              <span className="text-sm">{opt.label}</span>
              {selected.includes(opt.value) ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
          <PopoverListItem onClick={selectAll}>
            <span className="text-sm">Select all</span>
            {isAllSelected ? <span className="ml-auto text-xs">✓</span> : null}
          </PopoverListItem>
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
