"use client";

import type { ReactNode } from "react";
import {
  BULK_DELETE_CONFIRM_CLASS,
  SELECTABLE_LIST_SHELL_CLASS,
} from "@/components/selection/constants";
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard";
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
  variant?: "default" | "nested" | "plain";
  wrapList?: boolean;
  title?: string;
  headerAction?: ReactNode;
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
  variant = "default",
  wrapList = true,
  title,
  headerAction,
}: SelectableListShellProps) {
  const pluralLabel = pluralizeItemLabel(
    itemLabel,
    selection.selectedCount,
    itemLabelPlural,
  );
  const isNested = variant === "nested";
  const isPlain = variant === "plain";
  const toolbar = selection.isSelectingForRender ? (
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
      className={
        isNested
          ? cn(
              "h-auto border-b-0 bg-transparent px-4 py-0 backdrop-blur-none sticky top-0",
              toolbarClassName,
            )
          : toolbarClassName
      }
    />
  ) : null;
  const list = wrapList ? (
    <ul className="m-0 list-none p-0">{children}</ul>
  ) : (
    children
  );

  return (
    <div
      className={cn(
        isPlain
          ? "min-w-0"
          : isNested
            ? settingsCardShellClass
            : SELECTABLE_LIST_SHELL_CLASS,
        className,
      )}
    >
      {isNested && (toolbar || title || headerAction) ? (
        <header className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
          {toolbar ? (
            <div className="min-w-0 flex-1">{toolbar}</div>
          ) : (
            <>
              {title ? (
                <div className="flex min-w-0 items-center gap-3">
                  <h2 className="mt-0.5 text-sm font-medium leading-none text-foreground">
                    {title}
                  </h2>
                </div>
              ) : null}
              {headerAction ? (
                <div className="flex w-full shrink-0 items-center justify-end sm:w-auto sm:pl-4">
                  {headerAction}
                </div>
              ) : null}
            </>
          )}
        </header>
      ) : (
        toolbar
      )}
      {isNested ? (
        <div className={cn(settingsCardInnerClass, "overflow-hidden p-0")}>
          {list}
        </div>
      ) : (
        list
      )}
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
