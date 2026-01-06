"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@featul/ui/components/dialog"
import { Input } from "@featul/ui/components/input"
import { Button } from "@featul/ui/components/button"
import { Tag } from "lucide-react"
import TagIcon from "@featul/ui/icons/tag"

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
      <DialogContent className="p-1 bg-muted rounded-2xl gap-1">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <DialogTitle className="flex items-center gap-2 px-2 mt-0.5 py-0.5 text-sm font-normal">
            <TagIcon className="size-3.5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className=" bg-card rounded-lg p-2 dark:bg-black/40 border border-border">
          <DialogDescription className="text-sm mb-2 ">{description}</DialogDescription>

          <Input
            id="tag-name"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 placeholder:text-accent"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 px-3 text-sm">
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={disabled} className="h-8 px-4 text-sm">
              {saving ? loadingLabel : actionLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
