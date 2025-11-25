"use client"

import { useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@feedgot/ui/lib/utils"
import { getSlugFromPath, workspaceBase } from "@/config/nav"

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
  return <div className={cn("flex items-center", className)} />
}
