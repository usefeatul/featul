"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { ListFilterIcon } from "@feedgot/ui/icons/list-filter"
import { cn } from "@feedgot/ui/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { getSlugFromPath } from "@/config/nav"
import { parseArrayParam, buildRequestsUrl, toggleValue, isAllSelected as isAllSel } from "@/utils/request-filters"

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

  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const selected = React.useMemo(() => parseArrayParam(sp.get("status")).map((s) => String(s).toLowerCase()), [sp])
  const allValues = React.useMemo(() => options.map((o) => o.value), [])
  const isAllSelected = React.useMemo(() => isAllSel(allValues, selected), [selected, allValues])

  const toggle = (v: string) => {
    const next = toggleValue(selected, v)
    const href = buildRequestsUrl(slug, sp, { status: next })
    router.push(href)
  }

  const selectAll = () => {
    const next = isAllSelected ? [] : allValues
    const href = buildRequestsUrl(slug, sp, { status: next })
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
          {options.map((opt) => (
            <PopoverListItem key={opt.value} onClick={() => toggle(opt.value)}>
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
