"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@oreilla/ui/components/dialog"
import { Input } from "@oreilla/ui/components/input"
import { Button } from "@oreilla/ui/components/button"

export default function ModalCreateTag({ open, onOpenChange, onSave, saving }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (name: string) => void; saving?: boolean }) {
  const [name, setName] = React.useState("")

  React.useEffect(() => {
    if (!open) setName("")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-1/2 -translate-y-1/2 w-[min(92vw,520px)] sm:w-[420px] m-4">
        <DialogHeader>
          <DialogTitle>Create tag</DialogTitle>
          <DialogDescription className="text-accent">Add a new tag to categorize feedback.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="tag-name" className="text-xs">Name</label>
            <Input id="tag-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name" className="h-9 placeholder:text-accent" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(name)} disabled={Boolean(saving) || !name.trim()}>{saving ? "Creating..." : "Create"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

