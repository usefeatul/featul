"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { ChangelogEntryWithTags } from "@/app/workspaces/[slug]/changelog/data";
import ChangelogItem from "./ChangelogItem";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";
import { SelectionToolbar } from "@/components/requests/SelectionToolbar";
import { useBulkDeleteChangelog } from "../../hooks/useBulkDeleteChangelog";
import { useSelectableList } from "@/hooks/useSelectableList";
import EmptyChangelog from "./EmptyChangelog";

interface ChangelogListProps {
  items: ChangelogEntryWithTags[];
  workspaceSlug: string;
  initialTotalCount?: number;
  initialIsSelecting?: boolean;
  initialSelectedIds?: string[];
}

export function ChangelogList({
  items,
  workspaceSlug,
  initialTotalCount,
  initialIsSelecting,
  initialSelectedIds,
}: ChangelogListProps) {
  const [listItems, setListItems] = useState<ChangelogEntryWithTags[]>(items);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const listKey = `changelog-${workspaceSlug}`;
  const itemIds = useMemo(() => listItems.map((item) => item.id), [listItems]);

  const { isPending, isRefetching, handleBulkDelete } = useBulkDeleteChangelog({
    workspaceSlug,
    listKey,
    listItems,
    initialTotalCount,
    onItemsChange: setListItems,
    onComplete: () => setConfirmOpen(false),
  });

  useEffect(() => {
    setListItems(items);
  }, [items]);

  const {
    allSelected,
    isSelectingForRender,
    selectedCount,
    selectedIdsSet,
    toggleAll,
    toggleAtIndex,
  } = useSelectableList({
    listKey,
    itemIds,
    initialIsSelecting,
    initialSelectedIds,
    isPending,
    confirmOpen,
    setConfirmOpen,
  });

  if (listItems.length === 0) {
    if (isRefetching) {
      return null;
    }
    return <EmptyChangelog workspaceSlug={workspaceSlug} />;
  }

  return (
    <div className="overflow-hidden rounded-sm ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-card dark:bg-black/40 border border-border">
      {isSelectingForRender && (
        <SelectionToolbar
          allSelected={allSelected}
          selectedCount={selectedCount}
          totalCount={listItems.length}
          itemLabel="entry"
          isPending={isPending}
          onToggleAll={toggleAll}
          onConfirmDelete={() => setConfirmOpen(true)}
        />
      )}
      <ul className="m-0 list-none p-0">
        {listItems.map((entry, index) => (
          <ChangelogItem
            key={entry.id}
            item={entry}
            workspaceSlug={workspaceSlug}
            isSelecting={isSelectingForRender}
            isSelected={selectedIdsSet.has(entry.id)}
            onToggle={(checked, meta) =>
              toggleAtIndex(entry.id, index, {
                checked,
                shiftKey: meta?.shiftKey,
              })
            }
          />
        ))}
      </ul>

      <DestructiveConfirmDialog
        open={confirmOpen}
        isPending={isPending}
        onOpenChange={setConfirmOpen}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedCount} ${selectedCount === 1 ? "entry" : "entries"}?`}
        description="This action cannot be undone. These changelog entries will be permanently removed."
        confirmClassName="h-8 px-4 text-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      />
    </div>
  );
}
