"use client";

import React, { useEffect, useMemo, useState } from "react";
import RequestItem from "./RequestItem";
import type { RequestItemData } from "@/types/request";
import EmptyRequests from "./EmptyRequests";
import { BulkStatusPicker } from "@/components/selection/BulkStatusPicker";
import { SelectableListShell } from "@/components/selection/SelectableListShell";
import { useBulkDeleteRequests } from "@/hooks/useBulkDeleteList";
import { useBulkStatusUpdate } from "@/hooks/useBulkStatusUpdate";
import { useSelectableList } from "@/hooks/useSelectableList";
import {
  RequestListGroup,
  groupRequestsByStatus,
} from "./RequestListGroup";

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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const listKey = workspaceSlug;
  const itemIds = useMemo(() => listItems.map((item) => item.id), [listItems]);
  const groups = useMemo(() => groupRequestsByStatus(listItems), [listItems]);
  const itemIndexById = useMemo(() => {
    const map = new Map<string, number>();
    listItems.forEach((item, index) => map.set(item.id, index));
    return map;
  }, [listItems]);

  const { isPending, isRefetching, handleBulkDelete } = useBulkDeleteRequests({
    workspaceSlug,
    listKey,
    listItems,
    initialTotalCount,
    onItemsChange: setListItems,
    onComplete: () => setConfirmOpen(false),
  });

  const { isPending: isStatusPending, handleBulkStatus } = useBulkStatusUpdate({
    listKey,
    listItems,
    workspaceSlug,
    onItemsChange: setListItems,
  });

  const isBusy = isPending || isStatusPending;

  useEffect(() => {
    setListItems(items);
  }, [items]);

  const selection = useSelectableList({
    listKey,
    itemIds,
    initialIsSelecting,
    initialSelectedIds,
    isPending: isBusy,
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
      variant="nested"
      wrapList={false}
      toolbarClassName="border-l-2 border-l-transparent"
      isPending={isBusy}
      selection={selection}
      confirmOpen={confirmOpen}
      setConfirmOpen={setConfirmOpen}
      handleBulkDelete={handleBulkDelete}
      itemLabel="post"
      deleteDescription="This action cannot be undone. Comments, votes, and activity for these posts will be removed."
      totalCount={listItems.length}
      extraActions={
        <BulkStatusPicker
          disabled={selection.selectedCount === 0}
          isPending={isStatusPending}
          onSelect={handleBulkStatus}
        />
      }
    >
      <div className="min-w-0 py-1">
        {groups.map((group, index) => {
          const isCollapsed = Boolean(collapsed[group.status]);
          return (
            <RequestListGroup
              key={group.status}
              status={group.status}
              count={group.items.length}
              collapsed={isCollapsed}
              className={index > 0 ? "mt-0.5" : undefined}
              onToggle={() =>
                setCollapsed((current) => ({
                  ...current,
                  [group.status]: !current[group.status],
                }))
              }
            >
              <ul className="m-0 list-none divide-y divide-border/40 p-0 dark:divide-white/6">
                {group.items.map((item) => (
                  <RequestItem
                    key={item.id}
                    item={item}
                    workspaceSlug={workspaceSlug}
                    linkBase={linkBase}
                    disableLink={selection.isSelectingForRender}
                    {...selection.getItemSelectionProps(
                      item.id,
                      itemIndexById.get(item.id) ?? 0,
                    )}
                  />
                ))}
              </ul>
            </RequestListGroup>
          );
        })}
      </div>
    </SelectableListShell>
  );
}

export default React.memo(RequestListBase);
