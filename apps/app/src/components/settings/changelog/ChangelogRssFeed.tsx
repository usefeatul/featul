"use client"

import React from "react"
import CopyValueButton from "@/components/settings/domain/CopyValueButton"

function publicChangelogFeedUrl(slug: string, customDomain?: string | null) {
  const host = customDomain?.trim()
  if (host) return `https://${host}/changelog/feed.xml`
  return `https://${slug}.featul.com/changelog/feed.xml`
}

export default function ChangelogRssFeed({
  slug,
  customDomain,
}: {
  slug: string
  customDomain?: string | null
}) {
  const feedUrl = publicChangelogFeedUrl(slug, customDomain)

  return (
    <div className="space-y-2">
      <div className="text-md font-medium">RSS Feed</div>
      <div className="text-sm text-accent">
        Share this feed so customers can follow your changelog in any RSS reader.
      </div>
      <div className="flex items-center gap-2 rounded-md border bg-background p-3">
        <code className="min-w-0 flex-1 truncate text-xs text-foreground">
          {feedUrl}
        </code>
        <CopyValueButton value={feedUrl} label="RSS feed URL" />
      </div>
    </div>
  )
}
