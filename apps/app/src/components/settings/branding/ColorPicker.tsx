"use client"

import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@/components/global/icons";
import { BRANDING_COLORS } from "../../../types/colors"
import type { ColorOption } from "../../../types/colors"

export default function ColorPicker({ valueHex, onSelect, disabled }: { valueHex: string; onSelect: (c: ColorOption) => void; disabled?: boolean }) {
  const selected = BRANDING_COLORS.find((c) => c.primary.toLowerCase() === valueHex.trim().toLowerCase())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="selector"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs font-medium"
          disabled={disabled}
        >
          <span className="size-4 rounded-lg border" style={{ background: valueHex }} />
          <DropdownIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="w-fit">
        <PopoverList className="max-h-60 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {BRANDING_COLORS.map((c) => (
            <PopoverListItem
              key={c.key}
              accent={c.accent}
              role="menuitemradio"
              aria-checked={selected?.key === c.key}
              onClick={() => !disabled && onSelect(c)}
            >
              <span className="size-4 rounded-lg border" style={{ background: c.primary }} />
              <span className="text-sm">{c.name}</span>
              {selected?.key === c.key ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
