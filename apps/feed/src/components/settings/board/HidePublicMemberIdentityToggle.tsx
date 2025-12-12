"use client"

import React from "react"
import { Switch } from "@oreilla/ui/components/switch"
import { useGlobalBoardToggle } from "@/hooks/useGlobalBoardToggle"

export default function HidePublicMemberIdentityToggle({ slug }: { slug: string }) {
  const { value, onToggle } = useGlobalBoardToggle(slug, "hidePublicMemberIdentity", "Public member identity setting updated")

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Hide Public Member Identity</div>
      <div className="text-sm text-accent">Keep member names hidden on the public site.</div>
      <div className="rounded-md border bg-card p-3 flex items-center justify-between">
        <div className="text-sm">Hide public member names</div>
        <Switch checked={value} onCheckedChange={onToggle} aria-label="Hide Public Member Identity" />
      </div>
    </div>
  )
}
