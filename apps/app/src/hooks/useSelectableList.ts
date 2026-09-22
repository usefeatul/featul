"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBulkSelectionHotkeys } from "@/hooks/useBulkSelectionHotkeys";
import type { SelectionItemProps } from "@/components/selection/Row";
import {
  clearSelection,
  removeSelectedIds,
  selectAllForKey,
  setSelecting,
  toggleSelectionId,
  useSelection,
} from "@/lib/selection/store";
import type { SelectionHydrationState } from "@/types/selection";

type UseSelectableListParams = SelectionHydrationState & {
  listKey: string;
  itemIds: string[];
  isPending: boolean;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
};

type ToggleAtIndexOptions = {
  checked?: boolean;
  shiftKey?: boolean;
};

type UseSelectableListResult = {
  allSelected: boolean;
  isSelectingForRender: boolean;
  selectedCount: number;
  selectedIdsSet: Set<string>;
  toggleAll: () => void;
  getItemSelectionProps: (id: string, index: number) => SelectionItemProps;
  exitSelection: () => void;
};

/** Bulk-select list: shift-range, select-all, persist, and selection hotkeys. */
export function useSelectableList({
  listKey,
  itemIds,
  initialIsSelecting,
  initialSelectedIds,
  isPending,
  confirmOpen,
  setConfirmOpen,
}: UseSelectableListParams): UseSelectableListResult {
  const selection = useSelection(listKey);
  const isSelecting = selection.isSelecting;
  const selectingRef = useRef(isSelecting);
  const lastToggledIndexRef = useRef<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    selectingRef.current = isSelecting;
  }, [isSelecting]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!isSelecting) {
      lastToggledIndexRef.current = null;
    }
  }, [isSelecting]);

  const isSelectingForRender = hydrated
    ? isSelecting
    : (initialIsSelecting ?? isSelecting);
  const selectedIdsForRender = useMemo(() => {
    if (hydrated) return selection.selectedIds;
    if (initialSelectedIds && Array.isArray(initialSelectedIds)) {
      return initialSelectedIds;
    }
    return selection.selectedIds;
  }, [hydrated, selection.selectedIds, initialSelectedIds]);

  const exitSelection = useCallback(() => {
    clearSelection(listKey);
    setSelecting(listKey, false);
    setConfirmOpen(false);
    lastToggledIndexRef.current = null;
  }, [listKey, setConfirmOpen]);

  useBulkSelectionHotkeys({
    listKey,
    isSelecting: isSelectingForRender,
    isPending,
    selectedCount: selectedIdsForRender.length,
    confirmOpen,
    setConfirmOpen,
    selectingRef,
    onExitSelection: exitSelection,
  });

  const selectedIdsSet = useMemo(
    () => new Set(selectedIdsForRender),
    [selectedIdsForRender],
  );
  const allSelected = useMemo(
    () =>
      itemIds.length > 0 && itemIds.every((id) => selectedIdsSet.has(id)),
    [itemIds, selectedIdsSet],
  );
  const selectedCount = selectedIdsForRender.length;

  const toggleAtIndex = useCallback(
    (id: string, index: number, options?: ToggleAtIndexOptions) => {
      const { checked, shiftKey } = options ?? {};
      const anchor = lastToggledIndexRef.current;

      if (shiftKey && anchor !== null) {
        const start = Math.min(anchor, index);
        const end = Math.max(anchor, index);
        selectAllForKey(listKey, itemIds.slice(start, end + 1));
      } else {
        toggleSelectionId(listKey, id, checked);
      }

      lastToggledIndexRef.current = index;
    },
    [listKey, itemIds],
  );

  const toggleAll = useCallback(() => {
    if (allSelected) {
      removeSelectedIds(listKey, itemIds);
      lastToggledIndexRef.current = null;
      return;
    }
    selectAllForKey(listKey, itemIds);
    lastToggledIndexRef.current =
      itemIds.length > 0 ? itemIds.length - 1 : null;
  }, [allSelected, listKey, itemIds]);

  const getItemSelectionProps = useCallback(
    (id: string, index: number): SelectionItemProps => ({
      isSelecting: isSelectingForRender,
      isSelected: selectedIdsSet.has(id),
      onToggle: (checked, meta) =>
        toggleAtIndex(id, index, { checked, shiftKey: meta?.shiftKey }),
    }),
    [isSelectingForRender, selectedIdsSet, toggleAtIndex],
  );

  return {
    allSelected,
    isSelectingForRender,
    selectedCount,
    selectedIdsSet,
    toggleAll,
    getItemSelectionProps,
    exitSelection,
  };
}
