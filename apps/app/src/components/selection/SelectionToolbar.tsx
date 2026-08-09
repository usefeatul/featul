"use client"

import { Button } from "@featul/ui/components/button"
import { TrashIcon } from "@featul/ui/icons/trash"
import { cn } from "@featul/ui/lib/utils"
import { SelectionControl } from "./SelectionControl"
import { pluralizeItemLabel } from "./pluralize"

export interface SelectionToolbarProps {
  allSelected: boolean
  selectedCount: number
  totalCount: number
  itemLabel: string
  itemLabelPlural?: string
  isPending: boolean
  onToggleAll: () => void
  onConfirmDelete?: () => void
  hideDelete?: boolean
  className?: string
}

export function SelectionToolbar({
  allSelected,
  selectedCount,
  totalCount,
  itemLabel,
  itemLabelPlural,
  isPending,
  onToggleAll,
  onConfirmDelete,
  hideDelete = false,
  className,
}: SelectionToolbarProps) {
  const hasSelection = selectedCount > 0
  const pluralLabel = pluralizeItemLabel(
    itemLabel,
    selectedCount,
    itemLabelPlural,
  )

  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex h-10 w-full items-center gap-3 border-b border-border/70 bg-card/95 backdrop-blur-sm",
        className ?? "px-3 sm:px-4",
      )}
      role="toolbar"
      aria-label="Bulk selection actions"
    >
      <SelectionControl
        checked={allSelected}
        label={
          allSelected
            ? "Clear page selection"
            : `Select all ${totalCount} on this page`
        }
        onCheckedChange={() => onToggleAll()}
      />

      {hasSelection ? (
        <span className="rounded-sm bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
          {selectedCount} {pluralLabel}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Tap rows to select</span>
      )}

      <div className={cn("ml-auto", hideDelete && "hidden")}>
        <Button
          type="button"
          variant="card"
          size="sm"
          className={cn(
            "h-8 gap-1.5 rounded-sm px-3 bg-destructive text-white border-destructive/70 hover:bg-destructive/90 hover:text-white dark:bg-destructive/80 dark:hover:bg-destructive/70",
            !hasSelection && "pointer-events-none opacity-40",
          )}
          disabled={!hasSelection || isPending}
          onClick={onConfirmDelete}
          aria-label={`Delete selected ${pluralLabel}`}
        >
          <TrashIcon className="size-3.5" />
          <span>{isPending ? "Deleting…" : "Delete"}</span>
        </Button>
      </div>
    </div>
  )
}
