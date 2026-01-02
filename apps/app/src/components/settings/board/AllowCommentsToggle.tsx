"use client"

import React from "react"
import { Switch } from "@featul/ui/components/switch"
import { useGlobalBoardToggle, type FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle"

export default function AllowCommentsToggle({
  slug,
  initialBoards,
}: {
  slug: string
  initialBoards?: FeedbackBoardSettings[]
}) {
  const { value, onToggle } = useGlobalBoardToggle(
    slug,
    "allowComments",
    "Comments setting updated",
    initialBoards
  )

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Allow Comments</div>
      <div className="text-sm text-accent">Allow commenting on feedback posts.</div>
      <div className="rounded-md  border bg-card p-3 flex items-center justify-between">
        <div className="text-sm">Enable comments</div>
        <Switch checked={value} onCheckedChange={onToggle} aria-label="Allow Comments" />
      </div>
    </div>
  )
}
