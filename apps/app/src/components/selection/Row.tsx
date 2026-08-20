import { cn } from "@featul/ui/lib/utils"

export function getSelectableRowClassName(
  isSelecting: boolean,
  isSelected: boolean,
  baseClassName: string,
  hoverClassName = "hover:bg-muted/40",
) {
  return cn(
    baseClassName,
    isSelecting && "cursor-pointer select-none",
    isSelecting && !isSelected && "hover:bg-muted/20",
    isSelecting && isSelected && "bg-muted/45 dark:bg-muted/20",
    !isSelecting && cn(hoverClassName, "transition-colors"),
  )
}

export type SelectionToggleMeta = {
  shiftKey?: boolean
}

export type SelectionItemProps = {
  isSelecting?: boolean
  isSelected?: boolean
  onToggle?: (checked: boolean, meta?: SelectionToggleMeta) => void
}
