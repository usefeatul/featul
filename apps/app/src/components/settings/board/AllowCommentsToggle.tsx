"use client"

import React from "react"
import type { FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle"
import GlobalBoardToggleCard from "./GlobalBoardToggleCard"

export default function AllowCommentsToggle({
  slug,
  initialBoards,
}: {
  slug: string
  initialBoards?: FeedbackBoardSettings[]
}) {
  return (
    <GlobalBoardToggleCard
      slug={slug}
      initialBoards={initialBoards}
      toggleKey="allowComments"
      title="Allow Comments"
      description="Allow commenting on feedback posts."
      switchLabel="Enable comments"
      ariaLabel="Allow Comments"
      successMessage={(enabled) =>
        enabled ? "Comments enabled." : "Comments disabled."
      }
    />
  )
}
