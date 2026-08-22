"use client"

import React from "react"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import WorkspaceWizard from "@/components/wizard/Wizard"
import { PlusIcon } from "@featul/ui/icons/plus"

interface CreateWorkspaceDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isFirstWorkspace?: boolean
}

export function CreateWorkspaceDialog({
  open = false,
  onOpenChange,
  isFirstWorkspace = false,
}: CreateWorkspaceDialogProps) {
  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange ?? (() => {})}
      title="Create workspace"
      width="wide"
      offsetY="50%"
      dismissOnOutside={false}
      icon={<PlusIcon className="size-3.5" />}
    >
      <WorkspaceWizard isFirstWorkspace={isFirstWorkspace} />
    </SettingsDialogShell>
  )
}
