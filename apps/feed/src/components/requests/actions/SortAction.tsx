"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { ArrowUpDownIcon } from "@feedgot/ui/icons/arrow-up-down"
import { cn } from "@feedgot/ui/lib/utils"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { buildRequestsUrl } from "@/utils/request-filters"

export default function SortAction({ className = "" }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const slug = React.useMemo(() => {
    const parts = pathname.split("/")
    return parts[2] || ""
  }, [pathname])

  const order = (sp.get("order") || "newest").toLowerCase() === "oldest" ? "oldest" : "newest"

  const setOrder = (v: "newest" | "oldest") => {
    const href = buildRequestsUrl(slug, sp, { order: v })
    React.startTransition(() => router.push(href, { scroll: false }))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("rounded-md border bg-card px-2 py-2 cursor-pointer", className)} aria-label="Sort">
          <ArrowUpDownIcon className="w-4 h-4" size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          <PopoverListItem role="menuitemradio" aria-checked={order === "newest"}
            onClick={() => setOrder("newest")}>
            <span className="text-sm">Newest</span>
            {order === "newest" ? <span className="ml-auto text-xs">✓</span> : null}
          </PopoverListItem>
          <PopoverListItem role="menuitemradio" aria-checked={order === "oldest"}
            onClick={() => setOrder("oldest")} >
            <span className="text-sm">Oldest</span>
            {order === "oldest" ? <span className="ml-auto text-xs">✓</span> : null}
          </PopoverListItem>
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
