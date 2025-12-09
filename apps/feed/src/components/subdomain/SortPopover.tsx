"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@feedgot/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { ChevronDownIcon } from "@feedgot/ui/icons/chevron-down"
import { ListFilterIcon } from "@feedgot/ui/icons/list-filter"
import ArrowUpDownIcon from "@feedgot/ui/icons/arrow-up-down"

export function SortPopover({ slug, subdomain }: { slug: string; subdomain: string }) {
  const router = useRouter()
  const search = useSearchParams()
  const orderParam = String(search.get("order") || "likes").toLowerCase()
  const order = (orderParam === "oldest" ? "oldest" : orderParam === "likes" ? "likes" : "newest") as "newest" | "oldest" | "likes"
  const [open, setOpen] = React.useState(false)

  function go(nextOrder: "newest" | "oldest" | "likes") {
    const base = `/`
    const u = new URL(base, "http://dummy")
    const pageParam = search.get("page")
    const boardParam = search.get("board")
    if (pageParam) u.searchParams.set("page", pageParam)
    if (boardParam) u.searchParams.set("board", boardParam)
    u.searchParams.set("order", nextOrder)
    const q = u.searchParams.toString()
    setOpen(false)
    router.push(`${base}${q ? `?${q}` : ""}`)
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
