"use client"

import { Button } from "@feedgot/ui/components/button"
import { Search } from "lucide-react"

export function SearchAction() {
  return (
    <Button type="button" variant="nav" size="icon-sm" aria-label="Search" className="dark:bg-[#111113]">
      <Search className="size-4" />
    </Button>
  )
}
