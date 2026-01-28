"use client"

import type { FC } from "react"
import PlannedIcon from "@featul/ui/icons/planned"
import ProgressIcon from "@featul/ui/icons/progress"
import ReviewingIcon from "@featul/ui/icons/review"
import CompletedIcon from "@featul/ui/icons/completed"
import PendingIcon from "@featul/ui/icons/pending"
import ClosedIcon from "@featul/ui/icons/closed"

export default function StatusIcon({ status, className = "" }: { status?: string; className?: string }) {
  const s = (status || "").toLowerCase()
  const map: Record<string, FC<{ className?: string }>> = {
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

