"use client";

import type { ReactNode } from "react";
import {
  BULK_DELETE_CONFIRM_CLASS,
  SELECTABLE_LIST_SHELL_CLASS,
} from "@/components/selection/constants";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";
import { SelectionToolbar } from "@/components/selection/SelectionToolbar";
import { pluralizeItemLabel } from "@/components/selection/pluralize";
import type { useSelectableList } from "@/hooks/useSelectableList";
import { cn } from "@featul/ui/lib/utils";

type SelectionState = ReturnType<typeof useSelectableList>;

type SelectableListShellProps = {
  isPending: boolean;
  selection: SelectionState;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  handleBulkDelete: () => void;
  itemLabel: string;
  itemLabelPlural?: string;
  deleteDescription: string;
  totalCount: number;
  extraActions?: ReactNode;
  children: ReactNode;
  className?: string;
  toolbarClassName?: string;
};

export function SelectableListShell({
  isPending,
  selection,
  confirmOpen,
  setConfirmOpen,
  handleBulkDelete,
  itemLabel,
  itemLabelPlural,
  deleteDescription,
  totalCount,
  extraActions,
  children,
  className,
  toolbarClassName,
}: SelectableListShellProps) {
  const pluralLabel = pluralizeItemLabel(
    itemLabel,
    selection.selectedCount,
    itemLabelPlural,
  );

  return (
    <div className={cn(SELECTABLE_LIST_SHELL_CLASS, className)}>
      {selection.isSelectingForRender ? (
        <SelectionToolbar
          allSelected={selection.allSelected}
          selectedCount={selection.selectedCount}
          totalCount={totalCount}
          itemLabel={itemLabel}
          itemLabelPlural={itemLabelPlural}
          isPending={isPending}
          onToggleAll={selection.toggleAll}
          onConfirmDelete={() => setConfirmOpen(true)}
          extraActions={extraActions}
          className={toolbarClassName}
        />
      ) : null}
      <ul className="m-0 list-none p-0">{children}</ul>
      <DestructiveConfirmDialog
        open={confirmOpen}
        isPending={isPending}
        onOpenChange={setConfirmOpen}
        onConfirm={handleBulkDelete}
        title={`Delete ${selection.selectedCount} ${pluralLabel}?`}
        description={deleteDescription}
        confirmClassName={BULK_DELETE_CONFIRM_CLASS}
      />
    </div>
  );
}
