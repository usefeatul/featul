"use client"

import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@/components/global/icons";

type LayoutStyle = "compact" | "comfortable" | "spacious"

export default function LayoutStylePicker({ value, onSelect, options = ["compact", "comfortable", "spacious"], disabled }: { value: LayoutStyle; onSelect: (l: LayoutStyle) => void; options?: LayoutStyle[]; disabled?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="card"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs font-medium"
          disabled={disabled}
        >
          <span className="capitalize">{value}</span>
          <DropdownIcon className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="w-fit">
        <PopoverList>
          {options.map((l) => (
            <PopoverListItem
              key={l}
              role="menuitemradio"
              aria-checked={value === l}
              onClick={() => !disabled && onSelect(l)}
            >
              <span className="text-sm capitalize">{l}</span>
              {value === l ? <span className="ml-auto text-xs">✓</span> : null}
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
