"use client"

import PlannedIcon from "@oreilla/ui/icons/planned"
import ProgressIcon from "@oreilla/ui/icons/progress"
import ReviewingIcon from "@oreilla/ui/icons/review"
import CompletedIcon from "@oreilla/ui/icons/completed"
import PendingIcon from "@oreilla/ui/icons/pending"
import ClosedIcon from "@oreilla/ui/icons/closed"

export default function StatusIcon({ status, className = "" }: { status?: string; className?: string }) {
  const s = (status || "").toLowerCase()
  const map: Record<string, any> = {
    planned: PlannedIcon,
    progress: ProgressIcon,
    review: ReviewingIcon,
    completed: CompletedIcon,
    pending: PendingIcon,
    closed: ClosedIcon
  }
  const Icon = map[s] || PendingIcon
  return <Icon className={className} />
}

