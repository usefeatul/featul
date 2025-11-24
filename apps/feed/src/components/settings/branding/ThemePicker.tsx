"use client"

import { Button } from "@feedgot/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { DropdownIcon } from "@feedgot/ui/icons/dropdown"

type ThemeOption = "system" | "light" | "dark"

export default function ThemePicker({ value, onSelect, options = ["system", "light", "dark"] }: { value: ThemeOption; onSelect: (t: ThemeOption) => void; options?: ThemeOption[] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="h-9 w-fit min-w-0 justify-between px-2">
          <span className="text-sm capitalize">{value}</span>
          <DropdownIcon className="opacity-60" size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list>
        <PopoverList>
          {options.map((t) => (
            <PopoverListItem key={t} onClick={() => onSelect(t)}>
              <span className="text-sm capitalize">{t}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
