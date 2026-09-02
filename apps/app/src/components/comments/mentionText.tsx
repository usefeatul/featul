"use client"

import React from "react"
import { matchKnownMentions } from "@featul/api/shared/mentions"

/** Split comment text so only real workspace `@mentions` use the primary color. */
export function renderCommentMentions(
  text: string,
  mentionNames: string[] = [],
): React.ReactNode {
  if (!text) return text

  const matches = matchKnownMentions(text, mentionNames)
  if (matches.length === 0) return text

  const parts: React.ReactNode[] = []
  let lastIndex = 0

  for (const [key, match] of matches.entries()) {
    if (match.start > lastIndex) {
      parts.push(text.slice(lastIndex, match.start))
    }
    parts.push(
      <span key={`mention-${key}`} className="text-primary font-medium">
        {match.value}
      </span>,
    )
    lastIndex = match.end
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length > 0 ? parts : text
}
