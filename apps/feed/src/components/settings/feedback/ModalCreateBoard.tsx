"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@oreilla/ui/components/dialog"
import { Input } from "@oreilla/ui/components/input"
import { Button } from "@oreilla/ui/components/button"

export default function ModalCreateBoard({ open, onOpenChange, onSave, saving }: { open: boolean; onOpenChange: (v: boolean) => void; onSave: (params: { name: string; slug?: string }) => void; saving?: boolean }) {
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")

  React.useEffect(() => {
    if (!open) {
      setName("")
      setSlug("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-1/2 -translate-y-1/2 w-[min(92vw,520px)] sm:w-[420px] m-4">
        <DialogHeader>
          <DialogTitle>Create board</DialogTitle>
          <DialogDescription className="text-accent">Add a new board to organize your feedback.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="board-name" className="text-xs">Name</label>
            <Input id="board-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Board name" className="h-9 placeholder:text-accent" />
          </div>
          <div className="space-y-2">
            <label htmlFor="board-slug" className="text-xs">Slug (optional)</label>
            <Input id="board-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. features" className="h-9 placeholder:text-accent" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave({ name, slug })} disabled={Boolean(saving) || !name.trim()}>{saving ? "Creating..." : "Create"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

