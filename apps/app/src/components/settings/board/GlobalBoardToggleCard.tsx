"use client"

import React from "react"
import { Switch } from "@featul/ui/components/switch"
import {
  useGlobalBoardToggle,
  type FeedbackBoardSettings,
  type ToggleKey,
  type ToggleSuccessMessage,
} from "@/hooks/useGlobalBoardToggle"

type GlobalBoardToggleCardProps = {
  slug: string
  initialBoards?: FeedbackBoardSettings[]
  toggleKey: ToggleKey
  title: string
  description: string
  switchLabel: string
  ariaLabel: string
  successMessage?: ToggleSuccessMessage
}

export default function GlobalBoardToggleCard({
  slug,
  initialBoards,
  toggleKey,
  title,
  description,
  switchLabel,
  ariaLabel,
  successMessage,
}: GlobalBoardToggleCardProps) {
  const { value, onToggle } = useGlobalBoardToggle(
    slug,
    toggleKey,
    successMessage,
    initialBoards
  )

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">{title}</div>
      <div className="text-sm text-accent">{description}</div>
      <div className="bg-background flex items-center justify-between rounded-md border p-3">
        <div className="text-sm">{switchLabel}</div>
        <Switch checked={value} onCheckedChange={onToggle} aria-label={ariaLabel} />
      </div>
    </div>
  )
}
