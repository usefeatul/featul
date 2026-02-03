"use client"
import { Button } from "@featul/ui/components/button"
import { Checkbox } from "@featul/ui/components/checkbox"

export interface SelectionToolbarProps {
  allSelected: boolean
  selectedCount: number
  isPending: boolean
  onToggleAll: () => void
  onConfirmDelete: () => void
}

export function SelectionToolbar({ allSelected, selectedCount, isPending, onToggleAll, onConfirmDelete }: SelectionToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border/60 bg-muted/50">
      <Checkbox
        checked={allSelected}
        onCheckedChange={onToggleAll}
        aria-label="Select all"
        className="cursor-pointer border-border dark:border-border data-[state=checked]:border-primary"
      />
      <span className="text-xs text-accent">Selected {selectedCount}</span>
      <Button type="button" variant="ghost" size="sm" className="h-7 px-3" onClick={onToggleAll}>
        {allSelected ? "Clear" : "Select All"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="h-7 px-3 ml-auto group"
        disabled={selectedCount === 0 || isPending}
        onClick={onConfirmDelete}
      >
        <span>{isPending ? "Deleting…" : "Delete"}</span>
        {!isPending && selectedCount > 0 ? (
          <span className="ml-1 rounded-sm border px-1 py-0.5 text-xs leading-none text-accent bg-card dark:bg-black transition-colors group-hover:bg-card">
            D
          </span>
        ) : null}
      </Button>
    </div>
  )
}
