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
    (enabled) =>
      enabled
        ? "Comments enabled."
        : "Comments disabled.",
    initialBoards
  )

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Allow Comments</div>
      <div className="text-sm text-accent">Allow commenting on feedback posts.</div>
      <div className="bg-background flex items-center justify-between rounded-md border p-3">
        <div className="text-sm">Enable comments</div>
        <Switch checked={value} onCheckedChange={onToggle} aria-label="Allow Comments" />
      </div>
    </div>
  )
}
