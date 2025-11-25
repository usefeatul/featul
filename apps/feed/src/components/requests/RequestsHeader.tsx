"use client"

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@feedgot/ui/lib/utils"
import { getSlugFromPath, workspaceBase } from "@/config/nav"
import HeaderActions from "./HeaderActions"

function toLabel(s: string) {
  const t = s.toLowerCase()
  if (t === "under-review" || t === "review") return "Review"
  if (t === "in-progress" || t === "progress") return "Progress"
  if (t === "completed" || t === "complete") return "Complete"
  if (t === "planned") return "Planned"
  if (t === "pending") return "Pending"
  if (t === "closed" || t === "close") return "Closed"
  return s
}

export default function RequestsHeader({ selectedStatuses, className = "" }: { selectedStatuses: string[]; className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  useSearchParams()
  const statusLabels = useMemo(() => selectedStatuses.map(toLabel), [selectedStatuses])

  const clearFilters = () => {
    const slug = getSlugFromPath(pathname)
    router.push(workspaceBase(slug))
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <div className="text-xl font-semibold">Requests</div>
        {statusLabels.length > 0 ? (
          <div className="ml-2 flex items-center gap-1">
            {statusLabels.map((l) => (
              <span key={l} className="rounded-md bg-muted px-2 py-0.5 text-xs">{l}</span>
            ))}
            <button type="button" onClick={clearFilters} className="text-xs text-primary hover:underline px-2 py-0.5">Clear</button>
          </div>
        ) : null}
      </div>
      <HeaderActions />
    </div>
  )
}
