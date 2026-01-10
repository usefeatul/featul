"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import RequestItem, { type RequestItemData } from "./RequestItem"
import EmptyRequests from "./EmptyRequests"
import { useSelection, toggleSelectionId, selectAllForKey, removeSelectedIds } from "@/lib/selection-store"
import { BulkDeleteConfirmDialog } from "./BulkDeleteConfirmDialog"
import { SelectionToolbar } from "./SelectionToolbar"
import { useBulkDeleteRequests } from "./useBulkDeleteRequests"
import { useBulkSelectionHotkeys } from "./useBulkSelectionHotkeys"

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
  const selection = useSelection(listKey)
  const isSelecting = selection.isSelecting
  const selectingRef = useRef(isSelecting)
  const [hydrated, setHydrated] = useState(false)

  const { isPending, isRefetching, handleBulkDelete } = useBulkDeleteRequests({
    workspaceSlug,
    listKey,
    listItems,
    initialTotalCount,
    onItemsChange: setListItems,
    onComplete: () => setConfirmOpen(false),
  })

  useEffect(() => {
    selectingRef.current = isSelecting
  }, [isSelecting])

  useEffect(() => {
    setListItems(items)
  }, [items])

  useEffect(() => {
    setHydrated(true)
  }, [])

  const isSelectingForRender = hydrated ? isSelecting : initialIsSelecting ?? isSelecting
  const selectedIdsForRender = hydrated
    ? selection.selectedIds
    : initialSelectedIds && Array.isArray(initialSelectedIds)
      ? initialSelectedIds
      : selection.selectedIds

  useBulkSelectionHotkeys({
    listKey,
    isSelecting: isSelectingForRender,
    isPending,
    selectedCount: selectedIdsForRender.length,
    setConfirmOpen,
    selectingRef,
  })

  const allSelected = useMemo(
    () => listItems.length > 0 && listItems.every((i) => selectedIdsForRender.includes(i.id)),
    [listItems, selectedIdsForRender],
  )
  const selectedCount = selectedIdsForRender.length

  const toggleId = useCallback(
    (id: string, checked?: boolean) => {
      toggleSelectionId(listKey, id, checked)
    },
    [listKey]
  )

  const toggleAll = useCallback(() => {
    if (allSelected) {
      removeSelectedIds(listKey, listItems.map((i) => i.id))
      return
    }
    selectAllForKey(listKey, listItems.map((i) => i.id))
  }, [allSelected, listItems, listKey])

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
            isSelected={selectedIdsForRender.includes(p.id)}
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
