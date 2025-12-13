"use client"

import React from "react"
import { TagNameDialog } from "@/components/settings/global/TagNameDialog"

export default function ModalCreateTag({ open, onOpenChange, onSave, saving }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (name: string) => void; saving?: boolean }) {
  return (
    <TagNameDialog
      open={open}
      onOpenChange={onOpenChange}
      onSave={onSave}
      saving={saving}
      title="Create tag"
      description="Add a new tag to categorize feedback."
      label="Name"
      placeholder="Tag name"
      actionLabel="Create"
      loadingLabel="Creating..."
      disableWhenEmpty
    />
  )
}
