"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@oreilla/ui/components/dialog"
import { Input } from "@oreilla/ui/components/input"
import { Button } from "@oreilla/ui/components/button"

type TagNameDialogProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (name: string) => void
  saving?: boolean
  title: string
  description: string
  label?: string
  placeholder?: string
  actionLabel: string
  loadingLabel: string
  disableWhenEmpty?: boolean
}

export function TagNameDialog({
  open,
  onOpenChange,
  onSave,
  saving,
  title,
  description,
  label = "Name",
  placeholder = "Tag name",
  actionLabel,
  loadingLabel,
  disableWhenEmpty = true,
}: TagNameDialogProps) {
  const [value, setValue] = React.useState("")

  React.useEffect(() => {
    if (!open) setValue("")
  }, [open])

  const trimmed = value.trim()
  const disabled = Boolean(saving) || (disableWhenEmpty && !trimmed)

  const handleSubmit = () => {
    if (disabled) return
    onSave(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="tag-name" className="text-xs">
              {label}
            </label>
            <Input
              id="tag-name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="h-9 placeholder:text-accent"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={disabled}>
            {saving ? loadingLabel : actionLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

