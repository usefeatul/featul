"use client"

import React from "react"
import { Input } from "@featul/ui/components/input"
import BoardDialogIcon from "@featul/ui/icons/board-dialog"
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell"
import { LoadingButton } from "@/components/global/loading-button"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { toSlug } from "@/lib/slug"

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
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Create board"
      description="Add a new board to organize your feedback."
      width="wide"
      icon={<BoardDialogIcon className="size-3.5" />}
    >
      <div className="space-y-2">
        <div className="space-y-2">
          <label htmlFor="board-name" className="text-xs">Name</label>
          <Input id="board-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Board name" className="h-10 placeholder:text-accent" />
        </div>
        <div className="space-y-2">
          <label htmlFor="board-slug" className="text-xs">Slug (optional)</label>
          <Input
            id="board-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. features"
            className="h-10 placeholder:text-accent"
          />
        </div>
      </div>
 
      <div className="flex justify-end gap-2 mt-2.5">
        <LoadingButton type="button" variant="card" onClick={() => onOpenChange(false)}>
          Cancel
        </LoadingButton>
        <LoadingButton
          type="button"
          loading={Boolean(saving)}
          loadingIcon={<LoaderIcon className="size-4 animate-spin" />}
          onClick={() => onSave({ name: name.trim(), slug: slug ? toSlug(slug) : undefined })}
          disabled={!name.trim()}
        >
          Create
        </LoadingButton>
      </div>
    </SettingsDialogShell>
  )
}
