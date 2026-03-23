"use client";

import { useEffect } from "react";
import { setSelecting } from "@/lib/selection-store";

interface UseBulkSelectionHotkeysParams {
  listKey: string;
  isSelecting: boolean;
  isPending: boolean;
  selectedCount: number;
  setConfirmOpen: (open: boolean) => void;
  selectingRef: { current: boolean };
}

export function useBulkSelectionHotkeys({
  listKey,
  isSelecting,
  isPending,
  selectedCount,
  setConfirmOpen,
  selectingRef,
}: UseBulkSelectionHotkeysParams) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
      }

      const key = typeof event.key === "string" ? event.key.toLowerCase() : "";

      if ((event.metaKey || event.ctrlKey) && key === "d") {
        event.preventDefault();
        setSelecting(listKey, !selectingRef.current);
        return;
      }

      if (!event.metaKey && !event.ctrlKey && key === "d") {
        if (!isSelecting) return;
        if (isPending) return;
        if (selectedCount === 0) return;
        event.preventDefault();
        setConfirmOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    listKey,
    isSelecting,
    isPending,
    selectedCount,
    setConfirmOpen,
    selectingRef,
  ]);
}
