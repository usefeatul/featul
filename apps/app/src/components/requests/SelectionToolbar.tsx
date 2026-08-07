"use client"

import { Button } from "@featul/ui/components/button"
import { Checkbox } from "@featul/ui/components/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@featul/ui/components/tooltip"
import { TrashIcon } from "@featul/ui/icons/trash"
import { cn } from "@featul/ui/lib/utils"

export interface SelectionToolbarProps {
  allSelected: boolean
  selectedCount: number
  totalCount: number
  itemLabel: string
  isPending: boolean
  onToggleAll: () => void
  onConfirmDelete: () => void
}

export function SelectionToolbar({
  allSelected,
  selectedCount,
  totalCount,
  itemLabel,
  isPending,
  onToggleAll,
  onConfirmDelete,
}: SelectionToolbarProps) {
  const hasSelection = selectedCount > 0
  const pluralLabel = selectedCount === 1 ? itemLabel : `${itemLabel}s`

  return (
    <div
      className="sticky top-0 z-10 flex h-11 items-center gap-2 border-b border-border/70 bg-background/95 px-3 backdrop-blur-sm sm:gap-3 sm:px-4"
      role="toolbar"
      aria-label="Bulk selection actions"
    >
      <Checkbox
        checked={allSelected}
        onCheckedChange={onToggleAll}
        aria-label={
          allSelected
            ? "Clear page selection"
            : `Select all ${totalCount} on this page`
        }
        className="cursor-pointer border-border dark:border-border data-[state=checked]:border-primary"
      />

      <span
        className={cn(
          "min-w-[4.5rem] text-sm tabular-nums",
          hasSelection ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {hasSelection ? `${selectedCount} selected` : "Select"}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="card"
              size="sm"
              className={cn(
                "h-8 gap-1.5 px-3 bg-destructive text-white border-destructive/70 hover:bg-destructive/90 hover:text-white dark:bg-destructive/80 dark:hover:bg-destructive/70",
                !hasSelection && "opacity-60",
              )}
              disabled={!hasSelection || isPending}
              onClick={onConfirmDelete}
              aria-label={`Delete selected ${pluralLabel}`}
            >
              <TrashIcon className="size-3.5" />
              <span className="hidden sm:inline">
                {isPending ? "Deleting…" : "Delete"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6} className="px-2 py-1 text-xs">
            {isPending ? "Deleting…" : "Delete selected"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
