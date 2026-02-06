"use client"

import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import { BRANDING_COLORS } from "../../../types/colors"
import type { ColorOption } from "../../../types/colors"

export default function ColorPicker({ valueHex, onSelect, disabled }: { valueHex: string; onSelect: (c: ColorOption) => void; disabled?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="card" className="h-9 w-fit min-w-0 justify-between px-2" disabled={disabled}>
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 rounded-md border" style={{ background: valueHex }} />
          </span>
          <DropdownIcon className="opacity-60" size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list>
        <PopoverList className="max-h-60 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
