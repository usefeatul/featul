"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { ChevronDownIcon } from "@featul/ui/icons/chevron-down"
import ArrowUpDownIcon from "@featul/ui/icons/arrow-up-down"

export function SortPopover({
  slug,
  subdomain,
  basePath = "/",
  keepParams = ["page", "board"],
}: {
  slug: string
  subdomain: string
  basePath?: string
  keepParams?: string[]
}) {
  const router = useRouter()
  const search = useSearchParams()
  const orderParam = String(search.get("order") || "likes").toLowerCase()
  const order = (orderParam === "oldest" ? "oldest" : orderParam === "likes" ? "likes" : "newest") as "newest" | "oldest" | "likes"
  const [open, setOpen] = React.useState(false)

  function go(nextOrder: "newest" | "oldest" | "likes") {
    const u = new URL(basePath, "http://dummy")
    keepParams.forEach((key) => {
      const value = search.get(key)
      if (value) u.searchParams.set(key, value)
    })
    u.searchParams.set("order", nextOrder)
    const q = u.searchParams.toString()
    setOpen(false)
    router.push(`${u.pathname}${q ? `?${q}` : ""}`)
  }

  const label = order === "newest" ? "Newest" : order === "oldest" ? "Oldest" : "Most liked"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="nav" className="h-8 justify-start gap-2" aria-label="Sort" >
          <ArrowUpDownIcon className="size-4" />
          <span className="truncate">{label}</span>
          <ChevronDownIcon className="size-3 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent id={`popover-${subdomain}-${slug}-sort`} align="end" list className="w-fit">
        <PopoverList>
          <PopoverListItem onClick={() => go("newest")}> 
            <span className="text-sm">Newest</span>
          </PopoverListItem>
          <PopoverListItem onClick={() => go("oldest")}> 
            <span className="text-sm">Oldest</span>
          </PopoverListItem>
          <PopoverListItem onClick={() => go("likes")}> 
            <span className="text-sm">Most liked</span>
          </PopoverListItem>
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
