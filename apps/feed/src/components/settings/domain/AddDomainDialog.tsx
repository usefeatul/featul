"use client"

import React from "react"
import { Input } from "@oreilla/ui/components/input"
import { Button } from "@oreilla/ui/components/button"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import { LinkIcon } from "@oreilla/ui/icons/link"

export default function AddDomainDialog({
  open,
  onOpenChange,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (baseDomain: string) => void
  saving?: boolean
}) {
  const [value, setValue] = React.useState("")
  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Add domain"
      description="This will be the primary domain for your workspace."
      icon={<LinkIcon className="size-3.5" />}
    >
      <div className="space-y-2">
        <label htmlFor="domain" className="text-xs">
          Domain
        </label>
        <div className="relative flex items-center">
          <span className="inline-flex items-center h-9 px-2 bg-muted border rounded-l-md text-black/80 select-none">
            https://feedback.
          </span>
          <Input
            id="domain"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="example.com"
            className="h-9 flex-1 rounded-l-none border-l-0 placeholder:text-accent/70"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-3">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={() => onSave(value)} disabled={Boolean(saving)}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </SettingsDialogShell>
  )
}
