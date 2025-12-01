"use client"

import { Button } from "@feedgot/ui/components/button"
import { Search } from "lucide-react"

export function SearchAction() {
  return (
    <Button type="button" variant="ghost" size="icon-sm" aria-label="Search">
      <Search className="size-4" />
    </Button>
  )
}
