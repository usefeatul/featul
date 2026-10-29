"use client"

import React from "react"
import CopyValueButton from "@/components/settings/domain/CopyValueButton"
import SectionCard from "../global/SectionCard"
import { workspaceHost } from "@/config/domain"

function publicChangelogFeedUrl(slug: string, customDomain?: string | null) {
  const host = customDomain?.trim()
  if (host) return `https://${host}/changelog/feed.xml`
  return `https://${workspaceHost(slug)}/changelog/feed.xml`
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
    <SectionCard
      title="RSS feed"
      description="Share this feed so customers can follow your changelog in any RSS reader."
    >
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate text-xs text-foreground">
          {feedUrl}
        </code>
        <CopyValueButton value={feedUrl} label="RSS feed URL" />
      </div>
    </SectionCard>
  )
}
