"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
  DragEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

type Gesture = {
  pointerId: number;
  list: HTMLUListElement;
  scrollRoot: HTMLElement | null;
  startX: number;
  startY: number;
  x: number;
  y: number;
  lastIndex: number;
  checked: boolean;
  dragging: boolean;
};

type UseRequestDragSelectionOptions = {
  enabled: boolean;
  selectedIds: Set<string>;
  itemIds: string[];
  setRangeSelected: (fromIndex: number, toIndex: number, checked: boolean) => void;
};

const ROW_SELECTOR = "li[data-request-select-index]";
const DRAG_DISTANCE = 6;
const SCROLL_EDGE = 56;

/** Paints request rows during a mouse drag while bulk selection is active. */
export function useRequestDragSelection({
  enabled,
  selectedIds,
  itemIds,
  setRangeSelected,
}: UseRequestDragSelectionOptions) {
  const gestureRef = useRef<Gesture | null>(null);
  const suppressClickRef = useRef(false);
  const enabledRef = useRef(enabled);
  const selectedIdsRef = useRef(selectedIds);
  const itemIdsRef = useRef(itemIds);
  const setRangeSelectedRef = useRef(setRangeSelected);

  enabledRef.current = enabled;
  selectedIdsRef.current = selectedIds;
  itemIdsRef.current = itemIds;
  setRangeSelectedRef.current = setRangeSelected;

  useEffect(() => {
    let scrollFrame: number | null = null;
    let clickResetTimer: number | null = null;

    const stopScroll = () => {
      if (scrollFrame !== null) cancelAnimationFrame(scrollFrame);
      scrollFrame = null;
    };

    const rowIndexAt = (gesture: Gesture, x: number, y: number) => {
      const row = document.elementFromPoint(x, y)?.closest<HTMLElement>(ROW_SELECTOR);
      if (!row || !gesture.list.contains(row)) return null;
      const index = Number(row.dataset.requestSelectIndex);
      return Number.isInteger(index) && index >= 0 && index < itemIdsRef.current.length
        ? index
        : null;
    };

    const paintHoveredRow = (gesture: Gesture) => {
      const index = rowIndexAt(gesture, gesture.x, gesture.y);
      if (index === null || index === gesture.lastIndex) return;
      setRangeSelectedRef.current(gesture.lastIndex, index, gesture.checked);
      gesture.lastIndex = index;
    };

    const scrollAmount = (gesture: Gesture) => {
      const root = gesture.scrollRoot;
      const bounds = root?.getBoundingClientRect();
      const top = bounds?.top ?? 0;
      const bottom = bounds?.bottom ?? window.innerHeight;
      if (bounds && (gesture.x < bounds.left || gesture.x > bounds.right)) return 0;
      const scrollTop = root?.scrollTop ?? window.scrollY;
      const maxScroll = root
        ? root.scrollHeight - root.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      if (gesture.y < top + SCROLL_EDGE && scrollTop > 0) {
        return -Math.min(16, Math.ceil((top + SCROLL_EDGE - gesture.y) / 3));
      }
      if (gesture.y > bottom - SCROLL_EDGE && scrollTop < maxScroll) {
        return Math.min(16, Math.ceil((gesture.y - bottom + SCROLL_EDGE) / 3));
      }
      return 0;
    };

    const autoScroll = () => {
      scrollFrame = null;
      const gesture = gestureRef.current;
      if (!gesture?.dragging || !enabledRef.current) return;
      const amount = scrollAmount(gesture);
      if (amount === 0) return;
      const before = gesture.scrollRoot?.scrollTop ?? window.scrollY;
      if (gesture.scrollRoot) gesture.scrollRoot.scrollBy(0, amount);
      else window.scrollBy(0, amount);
      const after = gesture.scrollRoot?.scrollTop ?? window.scrollY;
      if (after === before) return;
      paintHoveredRow(gesture);
      scrollFrame = requestAnimationFrame(autoScroll);
    };

    const onPointerMove = (event: PointerEvent) => {
      const gesture = gestureRef.current;
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      if (!enabledRef.current) {
        gestureRef.current = null;
        stopScroll();
        return;
      }
      gesture.x = event.clientX;
      gesture.y = event.clientY;
      if (!gesture.dragging) {
        const distance = Math.hypot(
          gesture.x - gesture.startX,
          gesture.y - gesture.startY,
        );
        if (distance < DRAG_DISTANCE) return;
        gesture.dragging = true;
        setRangeSelectedRef.current(
          gesture.lastIndex,
          gesture.lastIndex,
          gesture.checked,
        );
      }
      if (event.cancelable) event.preventDefault();
      paintHoveredRow(gesture);
      if (scrollFrame === null && scrollAmount(gesture) !== 0) {
        scrollFrame = requestAnimationFrame(autoScroll);
      }
    };

    const onPointerEnd = (event: PointerEvent) => {
      const gesture = gestureRef.current;
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      if (gesture.dragging) {
        suppressClickRef.current = true;
        if (clickResetTimer !== null) clearTimeout(clickResetTimer);
        clickResetTimer = window.setTimeout(() => {
          suppressClickRef.current = false;
          clickResetTimer = null;
        }, 0);
      }
      gestureRef.current = null;
      stopScroll();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      if (clickResetTimer !== null) clearTimeout(clickResetTimer);
      stopScroll();
    };
  }, []);

  const onPointerDownCapture = useCallback(
    (event: ReactPointerEvent<HTMLUListElement>) => {
      if (!enabledRef.current || event.button !== 0 || event.pointerType === "touch") return;
      const target = event.target as Element;
      if (target.closest("button, input, textarea, a, [role='checkbox']")) return;
      const row = target.closest<HTMLElement>(ROW_SELECTOR);
      if (!row || !event.currentTarget.contains(row)) return;
      const index = Number(row.dataset.requestSelectIndex);
      const id = itemIdsRef.current[index];
      if (!Number.isInteger(index) || !id) return;
      gestureRef.current = {
        pointerId: event.pointerId,
        list: event.currentTarget,
        scrollRoot: event.currentTarget.closest<HTMLElement>("[data-workspace-scroll]"),
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        lastIndex: index,
        checked: !selectedIdsRef.current.has(id),
        dragging: false,
      };
    },
    [],
  );

  const onClickCapture = useCallback((event: MouseEvent<HTMLUListElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }, []);

  const onDragStartCapture = useCallback((event: DragEvent<HTMLUListElement>) => {
    if (enabledRef.current) event.preventDefault();
  }, []);

  return { onPointerDownCapture, onClickCapture, onDragStartCapture };
}
