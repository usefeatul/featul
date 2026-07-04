"use client"
import { Button } from "@featul/ui/components/button"
import { Checkbox } from "@featul/ui/components/checkbox"
import { Trash2, X } from "lucide-react"

export interface SelectionToolbarProps {
  allSelected: boolean
  selectedCount: number
  isPending: boolean
  onToggleAll: () => void
  onConfirmDelete: () => void
}

export function SelectionToolbar({ allSelected, selectedCount, isPending, onToggleAll, onConfirmDelete }: SelectionToolbarProps) {
  const hasSelection = selectedCount > 0

  return (
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border/60 bg-[var(--workspace-surface)] px-4 py-2 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onToggleAll}
          aria-label={allSelected ? "Clear selection" : "Select all"}
          className="cursor-pointer border-border bg-background/40 data-[state=checked]:border-primary"
        />
        <div className="flex min-w-0 items-center gap-2">
          <span className="rounded-md border border-border/70 bg-muted/40 px-2 py-1 text-xs font-medium tabular-nums text-foreground">
            {selectedCount}
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {selectedCount === 1 ? "item selected" : "items selected"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-muted-foreground hover:text-foreground"
          onClick={onToggleAll}
        >
          {allSelected ? (
            <>
              <X className="size-3.5" />
              <span>Clear</span>
            </>
          ) : (
            <span>Select all</span>
          )}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="h-8 px-3"
          disabled={!hasSelection || isPending}
          onClick={onConfirmDelete}
        >
          <Trash2 className="size-3.5" />
          <span>{isPending ? "Deleting..." : "Delete"}</span>
        </Button>
      </div>
    </div>
  )
}
