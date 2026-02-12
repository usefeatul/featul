"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useBulkSelectionHotkeys } from "@/hooks/useBulkSelectionHotkeys"
import { removeSelectedIds, selectAllForKey, toggleSelectionId, useSelection } from "@/lib/selection-store"
import type { SelectionHydrationState } from "@/types/selection"

type UseSelectableListParams = SelectionHydrationState & {
  listKey: string
  itemIds: string[]
  isPending: boolean
  setConfirmOpen: (open: boolean) => void
}

type UseSelectableListResult = {
  allSelected: boolean
  isSelectingForRender: boolean
  selectedCount: number
  selectedIdsForRender: string[]
  selectedIdsSet: Set<string>
  toggleAll: () => void
  toggleId: (id: string, checked?: boolean) => void
}

export function useSelectableList({
  listKey,
  itemIds,
  initialIsSelecting,
  initialSelectedIds,
  isPending,
  setConfirmOpen,
}: UseSelectableListParams): UseSelectableListResult {
  const selection = useSelection(listKey)
  const isSelecting = selection.isSelecting
  const selectingRef = useRef(isSelecting)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    selectingRef.current = isSelecting
  }, [isSelecting])

  useEffect(() => {
    setHydrated(true)
  }, [])

  const isSelectingForRender = hydrated ? isSelecting : initialIsSelecting ?? isSelecting
  const selectedIdsForRender = useMemo(() => {
    if (hydrated) return selection.selectedIds
    if (initialSelectedIds && Array.isArray(initialSelectedIds)) return initialSelectedIds
    return selection.selectedIds
  }, [hydrated, selection.selectedIds, initialSelectedIds])

  useBulkSelectionHotkeys({
    listKey,
    isSelecting: isSelectingForRender,
    isPending,
    selectedCount: selectedIdsForRender.length,
    setConfirmOpen,
    selectingRef,
  })

  const selectedIdsSet = useMemo(() => new Set(selectedIdsForRender), [selectedIdsForRender])
  const allSelected = useMemo(
    () => itemIds.length > 0 && itemIds.every((id) => selectedIdsSet.has(id)),
    [itemIds, selectedIdsSet],
  )
  const selectedCount = selectedIdsForRender.length

  const toggleId = useCallback(
    (id: string, checked?: boolean) => {
      toggleSelectionId(listKey, id, checked)
    },
    [listKey],
  )

  const toggleAll = useCallback(() => {
    if (allSelected) {
      removeSelectedIds(listKey, itemIds)
      return
    }
    selectAllForKey(listKey, itemIds)
  }, [allSelected, listKey, itemIds])

  return {
    allSelected,
    isSelectingForRender,
    selectedCount,
    selectedIdsForRender,
    selectedIdsSet,
    toggleAll,
    toggleId,
  }
}
