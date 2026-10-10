"use client"

import type { FC } from "react"
import {
  PlannedIcon,
  ProgressIcon,
  ReviewIcon as ReviewingIcon,
  CompletedIcon,
  PendingIcon,
  ClosedIcon,
} from "@/components/global/icons";






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

