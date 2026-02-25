"use client"

import React from "react"
import { Switch } from "@featul/ui/components/switch"
import { useGlobalBoardToggle, type FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle"

export default function AllowAnonymousToggle({
  slug,
  initialBoards,
}: {
  slug: string
  initialBoards?: FeedbackBoardSettings[]
}) {
  const { value, onToggle } = useGlobalBoardToggle(
    slug,
    "allowAnonymous",
    (enabled) =>
      enabled
        ? "Anonymous submissions enabled."
        : "Anonymous submissions disabled.",
    initialBoards
  )

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Allow Anonymous</div>
      <div className="text-sm text-accent">Let users submit feedback without logging in.</div>
      <div className="bg-background flex items-center justify-between rounded-md border p-3">
        <div className="text-sm">Enable anonymous submissions</div>
        <Switch checked={value} onCheckedChange={onToggle} aria-label="Allow Anonymous" />
      </div>
    </div>
  )
}
