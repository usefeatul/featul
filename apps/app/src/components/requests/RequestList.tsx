"use client"

import React, { useEffect, useMemo, useState } from "react"
import RequestItem from "./RequestItem"
import type { RequestItemData } from "@/types/request"
import EmptyRequests from "./EmptyRequests"
import { BulkDeleteConfirmDialog } from "./BulkDeleteConfirmDialog"
import { SelectionToolbar } from "./SelectionToolbar"
import { useBulkDeleteRequests } from "../../hooks/useBulkDeleteRequests"
import { useSelectableList } from "@/hooks/useSelectableList"

interface RequestListProps {
  items: RequestItemData[]
  workspaceSlug: string
  linkBase?: string
  initialTotalCount?: number
  initialIsSelecting?: boolean
  initialSelectedIds?: string[]
}

function RequestListBase(props: RequestListProps) {
  const { items, workspaceSlug, linkBase, initialTotalCount, initialIsSelecting, initialSelectedIds } = props
  const [listItems, setListItems] = useState<RequestItemData[]>(items)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const listKey = workspaceSlug
  const itemIds = useMemo(() => listItems.map((item) => item.id), [listItems])

  const { isPending, isRefetching, handleBulkDelete } = useBulkDeleteRequests({
    workspaceSlug,
    listKey,
    listItems,
    initialTotalCount,
    onItemsChange: setListItems,
    onComplete: () => setConfirmOpen(false),
  })

  useEffect(() => {
    setListItems(items)
  }, [items])

  const {
    allSelected,
    isSelectingForRender,
    selectedCount,
    selectedIdsSet,
    toggleAll,
    toggleId,
  } = useSelectableList({
    listKey,
    itemIds,
    initialIsSelecting,
    initialSelectedIds,
    isPending,
    setConfirmOpen,
  })

  if (listItems.length === 0) {
    if (isRefetching) {
      return null
    }
    return <EmptyRequests workspaceSlug={workspaceSlug} />
  }

  return (
    <div className="overflow-hidden rounded-sm ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black bg-card dark:bg-black/40 border border-border">
      {isSelectingForRender && (
        <SelectionToolbar
          allSelected={allSelected}
          selectedCount={selectedCount}
          isPending={isPending}
          onToggleAll={toggleAll}
          onConfirmDelete={() => setConfirmOpen(true)}
        />
      )}
      <ul className="m-0 list-none p-0">
        {listItems.map((p) => (
          <RequestItem
            key={p.id}
            item={p}
            workspaceSlug={workspaceSlug}
            linkBase={linkBase}
            isSelecting={isSelectingForRender}
            isSelected={selectedIdsSet.has(p.id)}
            onToggle={(checked) => toggleId(p.id, checked)}
            disableLink={isSelectingForRender}
          />
        ))}
      </ul>

      <BulkDeleteConfirmDialog
        open={confirmOpen}
        selectedCount={selectedCount}
        isPending={isPending}
        onOpenChange={setConfirmOpen}
        onConfirmDelete={handleBulkDelete}
      />
    </div>
  )
}

export default React.memo(RequestListBase)
