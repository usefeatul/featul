"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import { client } from "@featul/api/client"
import { usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { getSlugFromPath } from "@/config/nav"
import { cn } from "@featul/ui/lib/utils"
import { normalizeRoadmapStatus, type RoadmapStatus } from "@/lib/roadmap"
import StatusIcon from "../StatusIcon"

const STATUSES: RoadmapStatus[] = ["pending", "review", "planned", "progress", "completed", "closed"]

export default function StatusPicker({ postId, value, onChange, className }: { postId: string; value?: string | null; onChange: (v: RoadmapStatus) => void; className?: string }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const pathname = usePathname() || "/"
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])
  const queryClient = useQueryClient()
  const currentStatus = normalizeRoadmapStatus(value || "pending")

  const select = async (v: RoadmapStatus) => {
    if (saving) return
    setSaving(true)
    const prevStatus = normalizeRoadmapStatus(value || "pending")
    const nextStatus = normalizeRoadmapStatus(v)
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
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-2 pl-1.5 rounded-md  border text-xs font-medium transition-colors hover:bg-muted",
            className
          )}
        >
          <StatusIcon status={currentStatus} className="size-4 mr-2" />
          <span className="capitalize">{currentStatus}</span>
          <DropdownIcon className="ml-1.5  size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {STATUSES.map((s) => (
            <PopoverListItem key={s} role="menuitemradio" aria-checked={currentStatus === s} onClick={() => select(s)}>
              <span className="text-sm capitalize">{s.replace(/-/g, " ")}</span>
              {currentStatus === s ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
