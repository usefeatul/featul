"use client"

import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"

type ThemeOption = "system" | "light" | "dark"

export default function ThemePicker({ value, onSelect, options = ["system", "light", "dark"], disabled }: { value: ThemeOption; onSelect: (t: ThemeOption) => void; options?: ThemeOption[]; disabled?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="card" className="h-9 w-fit min-w-0 justify-between px-2" disabled={disabled}>
          <span className="text-sm capitalize">{value}</span>
          <DropdownIcon className="opacity-60" size={12} />
        </Button>
      </PopoverTrigger>
      <PopoverContent list>
        <PopoverList>
          {options.map((t) => (
            <PopoverListItem key={t} onClick={() => !disabled && onSelect(t)}>
              <span className="text-sm capitalize">{t}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
