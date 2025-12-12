"use client"

import { Button } from "@oreilla/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@oreilla/ui/components/popover"
import { DropdownIcon } from "@oreilla/ui/icons/dropdown"

type SidebarPosition = "left" | "right"

export default function SidebarPositionPicker({ value, onSelect, options = ["left", "right"], disabled }: { value: SidebarPosition; onSelect: (p: SidebarPosition) => void; options?: SidebarPosition[]; disabled?: boolean }) {
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
          {options.map((p) => (
            <PopoverListItem key={p} onClick={() => !disabled && onSelect(p)}>
              <span className="text-sm capitalize">{p}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
