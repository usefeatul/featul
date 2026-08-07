"use client";

import React, { useEffect, useMemo, useState } from "react";
import RequestItem from "./RequestItem";
import type { RequestItemData } from "@/types/request";
import EmptyRequests from "./EmptyRequests";
import { SelectableListShell } from "@/components/selection/SelectableListShell";
import { useBulkDeleteRequests } from "@/hooks/useBulkDeleteList";
import { useSelectableList } from "@/hooks/useSelectableList";

interface RequestListProps {
  items: RequestItemData[];
  workspaceSlug: string;
  linkBase?: string;
  initialTotalCount?: number;
  initialIsSelecting?: boolean;
  initialSelectedIds?: string[];
}

function RequestListBase(props: RequestListProps) {
  const {
    items,
    workspaceSlug,
    linkBase,
    initialTotalCount,
    initialIsSelecting,
    initialSelectedIds,
  } = props;
  const [listItems, setListItems] = useState<RequestItemData[]>(items);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const listKey = workspaceSlug;
  const itemIds = useMemo(() => listItems.map((item) => item.id), [listItems]);

  const { isPending, isRefetching, handleBulkDelete } = useBulkDeleteRequests({
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
    return <EmptyRequests workspaceSlug={workspaceSlug} />;
  }

  return (
    <SelectableListShell
      isPending={isPending}
      selection={selection}
      confirmOpen={confirmOpen}
      setConfirmOpen={setConfirmOpen}
      handleBulkDelete={handleBulkDelete}
      itemLabel="post"
      deleteDescription="This action cannot be undone. Comments, votes, and activity for these posts will be removed."
      totalCount={listItems.length}
    >
      {listItems.map((item, index) => (
        <RequestItem
          key={item.id}
          item={item}
          workspaceSlug={workspaceSlug}
          linkBase={linkBase}
          disableLink={selection.isSelectingForRender}
          {...selection.getItemSelectionProps(item.id, index)}
        />
      ))}
    </SelectableListShell>
  );
}

export default React.memo(RequestListBase);
