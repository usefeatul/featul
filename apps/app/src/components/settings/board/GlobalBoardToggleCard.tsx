"use client"

import React from "react"
import { Switch } from "@featul/ui/components/switch"
import {
  useGlobalBoardToggle,
  type FeedbackBoardSettings,
  type ToggleKey,
  type ToggleSuccessMessage,
} from "@/hooks/useGlobalBoardToggle"
import SectionCard from "../global/SectionCard"
import SettingRow from "../global/row"

type GlobalBoardToggleCardProps = {
  slug: string
  initialBoards?: FeedbackBoardSettings[]
  toggleKey: ToggleKey
  title: string
  description: string
  switchLabel: string
  ariaLabel: string
  successMessage?: ToggleSuccessMessage
}

export default function GlobalBoardToggleCard({
  slug,
  initialBoards,
  toggleKey,
  title,
  description,
  switchLabel,
  ariaLabel,
  successMessage,
}: GlobalBoardToggleCardProps) {
  const { value, onToggle } = useGlobalBoardToggle(
    slug,
    toggleKey,
    successMessage,
    initialBoards
  )

  return (
    <SectionCard title={title}>
      <div className="-my-4">
        <SettingRow label={switchLabel} description={description}>
          <Switch checked={value} onCheckedChange={onToggle} aria-label={ariaLabel} />
        </SettingRow>
      </div>
    </SectionCard>
  )
}
