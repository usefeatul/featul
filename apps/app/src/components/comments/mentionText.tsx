"use client"

import React from "react"

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const GENERIC_NAME = "[A-Za-z][A-Za-z0-9._-]*(?:\\s+[A-Za-z][A-Za-z0-9._-]*)?"
const MENTION_BOUNDARY = "(?=$|\\s|[.,;:!?()\\[\\]{}])"

/** Split comment text so `@mentions` render in the primary color. */
export function renderCommentMentions(
  text: string,
  mentionNames: string[] = [],
): React.ReactNode {
  if (!text) return text

  const names = [
    ...new Set(
      mentionNames
        .map((name) => name.trim())
        .filter(Boolean)
        .sort((left, right) => right.length - left.length),
    ),
  ]
  const alternates = [
    ...names.map(escapeRegExp),
    GENERIC_NAME,
  ].join("|")
  const pattern = new RegExp(`@(?:${alternates})${MENTION_BOUNDARY}`, "gi")
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <span key={`mention-${key++}`} className="text-primary font-medium">
        {match[0]}
      </span>,
    )
    lastIndex = match.index + match[0].length
    if (match[0].length === 0) {
      pattern.lastIndex += 1
    }
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts.length > 0 ? parts : text
}
