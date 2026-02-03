"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import { client } from "@featul/api/client"
import { REQUEST_FLAG_OPTIONS, type RequestFlagKey, type RequestFlags } from "@/types/request"

export default function FlagsPicker({ postId, value, onChange }: { postId: string; value: RequestFlags; onChange: (v: RequestFlags) => void }) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const toggle = async (key: RequestFlagKey) => {
    if (saving) return
    setSaving(true)
    try {
      const patch: RequestFlags = { [key]: !value[key] }
      await client.board.updatePostMeta.$post({ postId, ...patch })
      onChange({ ...value, ...patch })
    } finally {
      setSaving(false)
    }
  }

  const label = REQUEST_FLAG_OPTIONS
    .filter((option) => value[option.key])
    .map((option) => option.label.toLowerCase())
    .join(", ") || "flags"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
          <span className="rounded-md border  px-2 py-0.5 capitalize">{label}</span>
          <DropdownIcon className="ml-1  size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {REQUEST_FLAG_OPTIONS.map((option) => {
            const isChecked = !!value[option.key]
            return (
              <PopoverListItem key={option.key} role="menuitemcheckbox" aria-checked={isChecked} onClick={() => toggle(option.key)}>
                {option.label}{isChecked ? <span className="ml-auto text-xs">✓</span> : null}
              </PopoverListItem>
            )
          })}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
