"use client"

import { Checkbox } from "@featul/ui/components/checkbox"
import { cn } from "@featul/ui/lib/utils"

type SelectionControlProps = {
  checked: boolean
  visible: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
  onClick?: React.MouseEventHandler<HTMLElement>
}

export function SelectionControl({
  checked,
  visible,
  label,
  onCheckedChange,
  onClick,
}: SelectionControlProps) {
  return (
    <div
      className={cn(
        "flex w-5 shrink-0 items-center justify-center transition-opacity duration-200",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        onClick={onClick}
        className="size-4 cursor-pointer rounded-sm border-muted-foreground/35 shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />
    </div>
  )
}
