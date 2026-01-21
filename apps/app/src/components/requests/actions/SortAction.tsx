"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { ArrowUpDownIcon } from "@featul/ui/icons/arrow-up-down"
import { Button } from "@featul/ui/components/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { buildRequestsUrl } from "@/utils/request-filters"
import { type SortOrder, SORT_OPTIONS, parseSortOrder } from "@/types/sort"

interface SortActionProps {
  className?: string
}

export default function SortAction({ className = "" }: SortActionProps) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)

  const slug = React.useMemo(() => {
    const parts = pathname.split("/")
    return parts[2] || ""
  }, [pathname])

  const currentOrder = parseSortOrder(searchParams.get("order"))

  const handleOrderChange = React.useCallback((newOrder: SortOrder) => {
    const href = buildRequestsUrl(slug, searchParams, { order: newOrder })
    React.startTransition(() => router.push(href, { scroll: false }))
    setOpen(false)
  }, [slug, searchParams, router])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="nav"
          size="icon-sm"
          aria-label="Sort"
          className={className}
        >
          <ArrowUpDownIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {SORT_OPTIONS.map(({ value, label }) => (
            <PopoverListItem
              key={value}
              role="menuitemradio"
              aria-checked={currentOrder === value}
              onClick={() => handleOrderChange(value)}
            >
              <span className="text-sm">{label}</span>
              {currentOrder === value && <span className="ml-auto text-xs">✓</span>}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
