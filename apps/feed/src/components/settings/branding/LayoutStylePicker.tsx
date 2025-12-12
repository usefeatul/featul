"use client"

import { Button } from "@oreilla/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { DropdownIcon } from "@oreilla/ui/icons/dropdown"

type LayoutStyle = "compact" | "comfortable" | "spacious"

export default function LayoutStylePicker({ value, onSelect, options = ["compact", "comfortable", "spacious"], disabled }: { value: LayoutStyle; onSelect: (l: LayoutStyle) => void; options?: LayoutStyle[]; disabled?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="nav" className="h-9 w-fit min-w-0 justify-between px-2" disabled={disabled}>
          <span className="text-sm capitalize">{value}</span>
          <DropdownIcon className="opacity-60" size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list>
        <PopoverList>
          {options.map((l) => (
            <PopoverListItem key={l} onClick={() => !disabled && onSelect(l)}>
              <span className="text-sm capitalize">{l}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
