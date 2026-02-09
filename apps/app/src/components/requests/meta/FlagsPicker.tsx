"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import { client } from "@featul/api/client"
import { cn } from "@featul/ui/lib/utils"
import { REQUEST_FLAG_OPTIONS, type RequestFlagKey, type RequestFlags } from "@/types/request"

export default function FlagsPicker({ postId, value, onChange, className }: { postId: string; value: RequestFlags; onChange: (v: RequestFlags) => void; className?: string }) {
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

  const activeOptions = REQUEST_FLAG_OPTIONS.filter((option) => value[option.key])
  const label =
    activeOptions.length === 0
      ? "Flags"
      : activeOptions.length === 1
        ? activeOptions[0].label
        : `${activeOptions.length} flags`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 px-2.5 border text-xs font-medium transition-colors hover:bg-muted",
            saving && "opacity-70 cursor-wait",
            className
          )}
          aria-label="Manage flags"
          disabled={saving}
        >
          <span className="truncate max-w-[140px]">{label}</span>
          <DropdownIcon className="ml-1.5 size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="min-w-0 w-fit">
        <PopoverList>
          {REQUEST_FLAG_OPTIONS.map((option) => {
            const isChecked = !!value[option.key]
            return (
              <PopoverListItem key={option.key} role="menuitemcheckbox" aria-checked={isChecked} onClick={() => toggle(option.key)}>
                <span className="text-sm">{option.label}</span>
                {isChecked ? <span className="ml-auto text-xs">✓</span> : null}
              </PopoverListItem>
            )
          })}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
