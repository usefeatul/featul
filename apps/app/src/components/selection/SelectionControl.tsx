"use client"

import { Checkbox } from "@featul/ui/components/checkbox"

export const selectionCheckboxClassName =
  "size-4 cursor-pointer rounded-sm border-muted-foreground/35 shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary"

type SelectionControlProps = {
  checked: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
  onClick?: React.MouseEventHandler<HTMLElement>
}

export function SelectionControl({
  checked,
  label,
  onCheckedChange,
  onClick,
}: SelectionControlProps) {
  return (
    <div className="flex w-5 shrink-0 items-center justify-center">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
        onClick={onClick}
        className={selectionCheckboxClassName}
      />
    </div>
  )
}
