"use client"

import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard"

interface CommentsDisabledStateProps {
  title?: string
  description?: string
}

export default function CommentsDisabledState({
  title = "Comments are disabled",
  description = "The board owner has turned off comments for this board.",
}: CommentsDisabledStateProps) {
  return (
    <div className={settingsCardShellClass}>
      <header className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="mt-0.5 text-sm font-medium leading-none text-foreground">
            {title}
          </h2>
        </div>
      </header>
      <div className={settingsCardInnerClass}>
        <p className="text-sm text-accent">{description}</p>
      </div>
    </div>
  )
}
