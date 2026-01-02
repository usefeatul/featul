"use client"

import React from "react"
import SectionCard from "../global/SectionCard"
import AllowAnonymousToggle from "./AllowAnonymousToggle"
import AllowCommentsToggle from "./AllowCommentsToggle"
import ManageBoards from "./ManageBoards"
import HidePublicMemberIdentityToggle from "./HidePublicMemberIdentityToggle"
import type { FeedbackBoardSettings } from "@/hooks/useGlobalBoardToggle"

export default function BoardSettings({
  slug,
  plan,
  initialBoards,
}: {
  slug: string
  plan?: string
  initialBoards?: FeedbackBoardSettings[]
}) {
  return (
    <SectionCard title="Board Settings" description="Configure board settings">
      <div className="space-y-3">
        <AllowAnonymousToggle slug={slug} initialBoards={initialBoards} />
        <AllowCommentsToggle slug={slug} initialBoards={initialBoards} />
        <HidePublicMemberIdentityToggle slug={slug} initialBoards={initialBoards} />
        <ManageBoards slug={slug} plan={plan} initialBoards={initialBoards} />
      </div>
    </SectionCard>
  )
}
