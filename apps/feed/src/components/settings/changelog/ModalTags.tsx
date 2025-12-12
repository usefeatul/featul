"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@oreilla/ui/components/dialog"
import { Input } from "@oreilla/ui/components/input"
import { Button } from "@oreilla/ui/components/button"

export default function ModalTags({ open, onOpenChange, onSave, saving }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (name: string) => void; saving?: boolean }) {
  const [value, setValue] = React.useState("")
  React.useEffect(() => {
    if (!open) setValue("")
  }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-1/2 -translate-y-1/2 w-[min(92vw,450px)] sm:w-[380px] m-4">
        <DialogHeader>
          <DialogTitle>Add tag</DialogTitle>
          <DialogDescription className="text-accent">Create a new tag for your changelog.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="tag-name" className="text-xs">Tag name</label>
          <Input id="tag-name" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Tag name" className="h-9 placeholder:text-accent" />
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(value)} disabled={Boolean(saving)}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
