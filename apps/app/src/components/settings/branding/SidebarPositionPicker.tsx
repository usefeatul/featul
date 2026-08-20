"use client"

import { Button } from "@featul/ui/components/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import { cn } from "@featul/ui/lib/utils"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"

type SidebarPosition = "left" | "right"

export default function SidebarPositionPicker({ value, onSelect, options = ["left", "right"], disabled }: { value: SidebarPosition; onSelect: (p: SidebarPosition) => void; options?: SidebarPosition[]; disabled?: boolean }) {
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
            {options.map((p) => (
              <PopoverListItem
                key={p}
                role="menuitemradio"
                aria-checked={value === p}
                onClick={() => !disabled && onSelect(p)}
              >
                <span className="text-sm capitalize">{p}</span>
                {value === p ? <span className="ml-auto text-xs">✓</span> : null}
              </PopoverListItem>
            ))}
          </PopoverList>
        </PopoverContent>
      </Popover>
    </Toolbar>
  )
}
