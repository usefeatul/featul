"use client"

import { Button } from "@featul/ui/components/button"
import { Checkbox } from "@featul/ui/components/checkbox"
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
      className="sticky top-0 z-10 flex h-10 items-center gap-2.5 border-b border-border/70 bg-card/95 px-3 backdrop-blur-sm sm:px-4"
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
        className="size-4 shrink-0 cursor-pointer rounded-sm border-muted-foreground/35 shadow-none data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />

      {hasSelection ? (
        <span className="rounded-sm bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
          {selectedCount} {pluralLabel}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Tap rows to select</span>
      )}

      <div className="ml-auto">
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
