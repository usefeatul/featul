"use client"

import React from "react"
import { Button } from "@oreilla/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { DropdownIcon } from "@oreilla/ui/icons/dropdown"
import { client } from "@oreilla/api/client"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { getSlugFromPath } from "@/config/nav"
import { cn } from "@oreilla/ui/lib/utils"
import StatusIcon from "../StatusIcon"

const STATUSES = ["pending", "review", "planned", "progress", "completed", "closed"] as const

export default function StatusPicker({ postId, value, onChange, className }: { postId: string; value?: string; onChange: (v: string) => void; className?: string }) {
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
        <Button
          type="button"
          variant="nav"
          size="sm"
          className={cn(
            "h-8 px-2 pl-1.5 rounded-md  text-xs font-medium transition-colors hover:bg-muted",
            className
          )}
        >
          <StatusIcon status={value || "pending"} className="size-4 mr-2" />
          <span className="capitalize">{value || "pending"}</span>
          <DropdownIcon className="ml-1.5  size-3" />
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
