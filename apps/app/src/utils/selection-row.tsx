import { cn } from "@featul/ui/lib/utils"

export function getSelectableRowClassName(
  isSelecting: boolean,
  isSelected: boolean,
  baseClassName: string,
) {
  return cn(
    baseClassName,
    isSelecting && "cursor-pointer select-none",
    isSelecting && !isSelected && "hover:bg-muted/20",
    isSelecting &&
      isSelected &&
      "bg-muted/45 dark:bg-muted/20",
    !isSelecting && "hover:bg-background dark:hover:bg-background transition-colors",
  )
}

export type SelectionToggleMeta = {
  shiftKey?: boolean
}
