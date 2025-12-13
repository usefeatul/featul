"use client"

import React from "react"
import { TagNameDialog } from "@/components/settings/global/TagNameDialog"

export default function ModalTags({ open, onOpenChange, onSave, saving }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (name: string) => void; saving?: boolean }) {
  return (
    <TagNameDialog
      open={open}
      onOpenChange={onOpenChange}
      onSave={onSave}
      saving={saving}
      title="Add tag"
      description="Create a new tag for your changelog."
      label="Tag name"
      placeholder="Tag name"
      actionLabel="Save"
      loadingLabel="Saving..."
      disableWhenEmpty
    />
  )
}
