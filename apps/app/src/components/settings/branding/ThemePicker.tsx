"use client"

import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import { cn } from "@featul/ui/lib/utils"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"

type ThemeOption = "system" | "light" | "dark"

export default function ThemePicker({ value, onSelect, options = ["system", "light", "dark"], disabled }: { value: ThemeOption; onSelect: (t: ThemeOption) => void; options?: ThemeOption[]; disabled?: boolean }) {
  return (
    <Toolbar size="sm" className="w-fit">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="plain"
            size="sm"
            className={cn(toolbarItemClass, "h-8 gap-1.5 px-2.5 text-xs font-medium")}
            disabled={disabled}
          >
            <span className="capitalize">{value}</span>
            <DropdownIcon className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent list className="w-fit">
          <PopoverList>
            {options.map((t) => (
              <PopoverListItem
                key={t}
                role="menuitemradio"
                aria-checked={value === t}
                onClick={() => !disabled && onSelect(t)}
              >
                <span className="text-sm capitalize">{t}</span>
                {value === t ? <span className="ml-auto text-xs">✓</span> : null}
              </PopoverListItem>
            ))}
          </PopoverList>
        </PopoverContent>
      </Popover>
    </Toolbar>
  )
}
