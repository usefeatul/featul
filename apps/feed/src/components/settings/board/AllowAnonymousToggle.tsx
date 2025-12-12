"use client"

import React from "react"
import { Switch } from "@oreilla/ui/components/switch"
import { useGlobalBoardToggle } from "@/hooks/useGlobalBoardToggle"

export default function AllowAnonymousToggle({ slug }: { slug: string }) {
  const { value, onToggle } = useGlobalBoardToggle(slug, "allowAnonymous", "Anonymous submissions setting updated")

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">Allow Anonymous</div>
      <div className="text-sm text-accent">Let users submit feedback without logging in.</div>
      <div className="rounded-md border bg-card p-3 flex items-center justify-between">
        <div className="text-sm">Enable anonymous submissions</div>
        <Switch checked={value} onCheckedChange={onToggle} aria-label="Allow Anonymous" />
      </div>
    </div>
  )
}
