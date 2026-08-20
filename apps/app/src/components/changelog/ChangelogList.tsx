"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { ChangelogEntryWithTags } from "@/app/workspaces/[slug]/changelog/data";
import ChangelogItem from "./ChangelogItem";
import { SelectableListShell } from "@/components/selection/SelectableListShell";
import { useBulkDeleteChangelog } from "@/hooks/useBulkDeleteList";
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

  const selection = useSelectableList({
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
    <SelectableListShell
      variant="nested"
      isPending={isPending}
      selection={selection}
      confirmOpen={confirmOpen}
      setConfirmOpen={setConfirmOpen}
      handleBulkDelete={handleBulkDelete}
      itemLabel="entry"
      itemLabelPlural="entries"
      deleteDescription="This action cannot be undone. These changelog entries will be permanently removed."
      totalCount={listItems.length}
    >
      {listItems.map((entry, index) => (
        <ChangelogItem
          key={entry.id}
          item={entry}
          workspaceSlug={workspaceSlug}
          {...selection.getItemSelectionProps(entry.id, index)}
        />
      ))}
    </SelectableListShell>
  );
}
