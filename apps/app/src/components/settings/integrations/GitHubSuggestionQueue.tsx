"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import type { GithubSuggestionItem } from "@/hooks/useGithubIntegration"

type Props = {
  items: GithubSuggestionItem[]
  isPending?: boolean
  onApply: (id: string, action: "accept" | "reject") => Promise<boolean>
}

export default function GitHubSuggestionQueue({ items, isPending = false, onApply }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-md border border-border px-3 py-2 text-sm text-accent">
        No pending AI status suggestions.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-md border border-border p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.postTitle}</p>
              <p className="text-xs text-accent mt-1">
                Suggest: <span className="font-medium text-foreground">{item.suggestedRoadmapStatus || "pending"}</span>
                {typeof item.suggestionConfidence === "number" ? ` (${Math.round(item.suggestionConfidence * 100)}%)` : ""}
              </p>
              <p className="text-xs text-accent mt-1 line-clamp-2">{item.suggestionReason || "No reason provided"}</p>
              {item.hasContentConflict ? (
                <p className="text-xs text-orange-600 mt-1">Content conflict detected; title/body were not auto-updated.</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="xs" onClick={() => onApply(item.id, "accept")} disabled={isPending}>
                Accept
              </Button>
              <Button size="xs" variant="card" onClick={() => onApply(item.id, "reject")} disabled={isPending}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
