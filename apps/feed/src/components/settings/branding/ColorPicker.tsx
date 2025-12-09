"use client"

import { Button } from "@feedgot/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { DropdownIcon } from "@feedgot/ui/icons/dropdown"
import { BRANDING_COLORS } from "../../../types/colors"
import type { ColorOption } from "../../../types/colors"

export default function ColorPicker({ valueHex, onSelect, disabled }: { valueHex: string; onSelect: (c: ColorOption) => void; disabled?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="nav" className="h-9 w-fit min-w-0 justify-between px-2" disabled={disabled}>
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 rounded-md border" style={{ background: valueHex }} />
          </span>
          <DropdownIcon className="opacity-60" size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list>
        <PopoverList>
          {BRANDING_COLORS.map((c) => (
            <PopoverListItem key={c.key} accent={c.accent} onClick={() => !disabled && onSelect(c)}>
              <span className="w-4 h-4 rounded-md border" style={{ background: c.primary }} />
              <span className="text-sm">{c.name}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
