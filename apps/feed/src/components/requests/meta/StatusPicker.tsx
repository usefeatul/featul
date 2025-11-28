"use client"

import React from "react"
import { Button } from "@feedgot/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { DropdownIcon } from "@feedgot/ui/icons/dropdown"
import { client } from "@feedgot/api/client"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { getSlugFromPath } from "@/config/nav"

const STATUSES = ["pending", "review", "planned", "progress", "completed", "closed"] as const

export default function StatusPicker({ postId, value, onChange }: { postId: string; value?: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const pathname = usePathname() || "/"
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])
  const queryClient = useQueryClient()

  const select = async (v: string) => {
    if (saving) return
    setSaving(true)
    const normalize = (s: string) => {
      const raw = (s || "pending").trim().toLowerCase().replace(/[\s-]+/g, "")
      const map: Record<string, string> = { pending:"pending", review:"review", inreviewing:"review", planned:"planned", progress:"progress", inprogress:"progress", completed:"completed", closed:"closed" }
      return map[raw] || "pending"
    }
    const prevStatus = normalize(value || "pending")
    const nextStatus = normalize(v || "pending")
    try {
      onChange(v)
      setOpen(false)
      if (slug) {
        queryClient.setQueryData(["status-counts", slug], (prev: any) => {
          if (!prev) return prev
          const copy: Record<string, number> = { ...prev }
          if (prevStatus && typeof copy[prevStatus] === "number") copy[prevStatus] = Math.max(0, (copy[prevStatus] || 0) - 1)
          copy[nextStatus] = ((copy[nextStatus] || 0) + 1)
          return copy
        })
      }
      await client.board.updatePostMeta.$post({ postId, roadmapStatus: v })
      if (slug) queryClient.invalidateQueries({ queryKey: ["status-counts", slug] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
          <span className="rounded-md bg-card px-2 py-0.5 capitalize">{value || "pending"}</span>
          <DropdownIcon className="ml-1 opacity-60" size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {STATUSES.map((s) => (
            <PopoverListItem key={s} role="menuitemradio" aria-checked={(value || "").toLowerCase() === s} onClick={() => select(s)}>
              <span className="text-sm capitalize">{s.replace(/-/g, " ")}</span>
              {(value || "").toLowerCase() === s ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
