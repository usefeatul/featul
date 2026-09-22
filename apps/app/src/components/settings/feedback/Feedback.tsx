"use client"

import React from "react"
import RoadmapVisibility from "./RoadmapVisibility"
import ManageTags, { type FeedbackTag } from "./ManageTags"
import type { FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle"

export default function FeedbackSection({
  slug,
  plan,
  initialBoards,
  initialTags,
}: {
  slug: string
  plan?: string
  initialBoards?: FeedbackBoardSettings[]
  initialTags?: FeedbackTag[]
}) {
  return (
    <div className="space-y-4">
      <RoadmapVisibility slug={slug} initialBoards={initialBoards} />
      <ManageTags slug={slug} plan={plan} initialTags={initialTags} />
    </div>
  )
}
