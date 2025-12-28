"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import WorkspaceWizard from "@/components/wizard/Wizard"
import { PlusIcon } from "@oreilla/ui/icons/plus"

interface CreateWorkspaceDialogProps {
  open?: boolean
}

export function CreateWorkspaceDialog({ open = false }: CreateWorkspaceDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(open)

  const handleOpenChange = React.useCallback((v: boolean) => {
    setIsOpen(v)
    if (!v) {
      try {
        router.back()
      } catch {
        router.push("/")
      }
    }
  }, [router])

  return (
    <SettingsDialogShell
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Create workspace"
      width="wide"
      offsetY="50%"
      icon={<PlusIcon className="size-3.5" />}
    >
      <WorkspaceWizard />
    </SettingsDialogShell>
  )
}
