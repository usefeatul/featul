"use client"

import React from "react"
import type { FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle"
import GlobalBoardToggleCard from "./GlobalBoardToggleCard"

export default function AllowAnonymousToggle({
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
      toggleKey="allowAnonymous"
      title="Allow Anonymous"
      description="Let users submit feedback without logging in."
      switchLabel="Enable anonymous submissions"
      ariaLabel="Allow Anonymous"
      successMessage={(enabled) =>
        enabled
          ? "Anonymous submissions enabled."
          : "Anonymous submissions disabled."
      }
    />
  )
}
