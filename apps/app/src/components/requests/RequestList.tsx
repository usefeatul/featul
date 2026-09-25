"use client";

import React, { useMemo, useState } from "react";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { Button } from "@featul/ui/components/button";
import { useInfiniteRequests } from "@/hooks/useInfiniteRequests";
import RequestItem from "./RequestItem";
import type { RequestItemData } from "@/types/request";
import EmptyRequests from "./EmptyRequests";
import { BulkStatusPicker } from "@/components/selection/BulkStatusPicker";
import { SelectableListShell } from "@/components/selection/SelectableListShell";
import { useBulkDeleteRequests } from "@/hooks/useBulkDeleteList";
import { useBulkStatusUpdate } from "@/hooks/useBulkStatusUpdate";
import { useSelectableList } from "@/hooks/useSelectableList";
import { useRequestDragSelection } from "@/hooks/useRequestDragSelection";

interface RequestListProps {
  items: RequestItemData[];
  workspaceSlug: string;
  linkBase?: string;
  initialTotalCount?: number;
  initialOffset?: number;
  variant?: "workspace" | "requests";
  initialIsSelecting?: boolean;
  initialSelectedIds?: string[];
}

function RequestListBase(props: RequestListProps) {
  const {
    items,
    workspaceSlug,
    linkBase,
    initialTotalCount,
    initialOffset = items.length,
    variant = "requests",
    initialIsSelecting,
    initialSelectedIds,
  } = props;
  const { listItems, setListItems, sentinelRef, hasMore, isLoading, error, loadMore } = useInfiniteRequests({
    items,
    workspaceSlug,
    initialOffset,
    initialTotalCount: initialTotalCount ?? items.length,
    variant,
  });
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

  const { isPending: isStatusPending, handleBulkStatus } = useBulkStatusUpdate({
    listKey,
    listItems,
    workspaceSlug,
    onItemsChange: setListItems,
  });

  const isBusy = isPending || isStatusPending;

  const selection = useSelectableList({
    listKey,
    itemIds,
    initialIsSelecting,
    initialSelectedIds,
    isPending: isBusy,
    confirmOpen,
    setConfirmOpen,
  });
  const dragSelection = useRequestDragSelection({
    enabled: selection.isSelectingForRender && !isBusy && !confirmOpen,
    selectedIds: selection.selectedIdsSet,
    itemIds,
    setRangeSelected: selection.setRangeSelected,
  });

  if (listItems.length === 0) {
    if (isRefetching) {
      return null;
    }
    return <EmptyRequests workspaceSlug={workspaceSlug} />;
  }

  return (
    <SelectableListShell
      variant="plain"
      className="w-full"
      wrapList={false}
      toolbarClassName="px-4 sm:px-6"
      isPending={isBusy}
      selection={selection}
      confirmOpen={confirmOpen}
      setConfirmOpen={setConfirmOpen}
      handleBulkDelete={handleBulkDelete}
      itemLabel="post"
      emptySelectionHint="Click or drag rows to select"
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
      <ul
        className="m-0 min-w-0 list-none p-0 [&>li+li]:border-t [&>li+li]:border-border/40 dark:[&>li+li]:border-white/6"
        {...dragSelection}
      >
        {listItems.map((item, index) => (
          <RequestItem
            key={item.id}
            item={item}
            selectionIndex={index}
            workspaceSlug={workspaceSlug}
            linkBase={linkBase}
            disableLink={selection.isSelectingForRender}
            {...selection.getItemSelectionProps(item.id, index)}
          />
        ))}
      </ul>
      <div
        ref={sentinelRef}
        className={hasMore || error ? "flex h-10 items-center justify-center px-4" : "h-px"}
        aria-live="polite"
        aria-busy={isLoading}
      >
        {error ? (
          <Button variant="plain" size="sm" onClick={() => void loadMore()} aria-label="Loading failed. Retry loading requests">
            Try again
          </Button>
        ) : isLoading ? (
          <span role="status" className="text-accent">
            <LoaderIcon className="size-5" size={20} />
            <span className="sr-only">Loading requests</span>
          </span>
        ) : null}
      </div>
    </SelectableListShell>
  );
}

export default React.memo(RequestListBase);
