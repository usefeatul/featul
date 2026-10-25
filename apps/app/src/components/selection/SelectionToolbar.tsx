"use client"

import type { ReactNode } from "react"
import { Button } from "@featul/ui/components/button"
import { TrashIcon } from "@/components/global/icons"
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
  extraActions?: ReactNode
  emptySelectionHint?: string
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
  extraActions,
  emptySelectionHint = "Tap rows to select",
  className,
}: SelectionToolbarProps) {
  const hasSelection = selectedCount > 0
  const pluralLabel = pluralizeItemLabel(
    itemLabel,
    selectedCount,
    itemLabelPlural,
  )
  const showActions = Boolean(extraActions) || !hideDelete

  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex h-10 w-full items-center gap-3 border-b border-border/70 bg-sidebar dark:bg-card",
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
        <span className="rounded-lg bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums text-foreground">
          {selectedCount} {pluralLabel}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">{emptySelectionHint}</span>
      )}

      {/* Bulk actions appear once something is selected instead of sitting greyed out. */}
      {showActions && hasSelection ? (
        <div className="ml-auto flex items-center gap-2">
          {extraActions}
          {!hideDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 gap-1.5 rounded-lg px-3 py-0"
              disabled={isPending}
              onClick={onConfirmDelete}
              aria-label={`Delete selected ${pluralLabel}`}
            >
              <TrashIcon className="size-3.5" />
              <span>{isPending ? "Deleting…" : "Delete"}</span>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
