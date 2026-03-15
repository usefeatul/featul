"use client"

import React from "react"
import type { FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle"
import GlobalBoardToggleCard from "./GlobalBoardToggleCard"

export default function HidePublicMemberIdentityToggle({
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
      toggleKey="hidePublicMemberIdentity"
      title="Hide Public Member Identity"
      description="Keep member names hidden on the public site."
      switchLabel="Hide public member names"
      ariaLabel="Hide Public Member Identity"
      successMessage={(enabled) =>
        enabled
          ? "Public member names hidden."
          : "Public member names visible."
      }
    />
  )
}
