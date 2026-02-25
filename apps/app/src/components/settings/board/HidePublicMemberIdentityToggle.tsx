"use client"

import React from "react"
import { Switch } from "@featul/ui/components/switch"
import { useGlobalBoardToggle, type FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle"

export default function HidePublicMemberIdentityToggle({
  slug,
  initialBoards,
}: {
  slug: string
  initialBoards?: FeedbackBoardSettings[]
}) {
  const { value, onToggle } = useGlobalBoardToggle(
    slug,
    "hidePublicMemberIdentity",
    (enabled) =>
      enabled
        ? "Public member names hidden."
        : "Public member names visible.",
    initialBoards
  )

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Hide Public Member Identity</div>
      <div className="text-sm text-accent">Keep member names hidden on the public site.</div>
      <div className="bg-background flex items-center justify-between rounded-md border p-3">
        <div className="text-sm">Hide public member names</div>
        <Switch checked={value} onCheckedChange={onToggle} aria-label="Hide Public Member Identity" />
      </div>
    </div>
  )
}
