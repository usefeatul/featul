"use client"

import React from "react"
import { Button } from "@oreilla/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { DropdownIcon } from "@oreilla/ui/icons/dropdown"
import { client } from "@oreilla/api/client"

type Flags = { isPinned?: boolean; isLocked?: boolean; isFeatured?: boolean }

export default function FlagsPicker({ postId, value, onChange }: { postId: string; value: Flags; onChange: (v: Flags) => void }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const toggle = async (key: keyof Flags) => {
    if (saving) return
    setSaving(true)
    try {
      const patch: Flags = { [key]: !value[key] } as Flags
      await client.board.updatePostMeta.$post({ postId, ...patch })
      onChange({ ...value, ...patch })
    } finally {
      setSaving(false)
    }
  }

  const label = [value.isPinned ? "pinned" : null, value.isLocked ? "locked" : null, value.isFeatured ? "featured" : null].filter(Boolean).join(", ") || "flags"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="nav" size="sm" className="h-7 px-2">
          <span className="rounded-md  px-2 py-0.5 capitalize">{label}</span>
          <DropdownIcon className="ml-1  size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          <PopoverListItem role="menuitemcheckbox" aria-checked={!!value.isPinned} onClick={() => toggle("isPinned")}>Pinned{value.isPinned ? <span className="ml-auto text-xs">✓</span> : null}</PopoverListItem>
          <PopoverListItem role="menuitemcheckbox" aria-checked={!!value.isLocked} onClick={() => toggle("isLocked")}>Locked{value.isLocked ? <span className="ml-auto text-xs">✓</span> : null}</PopoverListItem>
          <PopoverListItem role="menuitemcheckbox" aria-checked={!!value.isFeatured} onClick={() => toggle("isFeatured")}>Featured{value.isFeatured ? <span className="ml-auto text-xs">✓</span> : null}</PopoverListItem>
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
