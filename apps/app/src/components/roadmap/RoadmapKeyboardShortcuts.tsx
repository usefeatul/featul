"use client";

import React from "react";

function isTextInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return !!target.closest(
    "input, textarea, select, [contenteditable='true'], [role='textbox']",
  );
}

export default function RoadmapKeyboardShortcuts({
  columnCount,
  getCurrentIndex,
  onJumpToIndex,
}: {
  columnCount: number;
  getCurrentIndex: () => number;
  onJumpToIndex: (index: number) => void;
}) {
  const jumpToIndex = React.useCallback(
    (index: number) => {
      if (columnCount <= 0) return;
      const nextIndex = Math.max(0, Math.min(index, columnCount - 1));
      onJumpToIndex(nextIndex);
    },
    [columnCount, onJumpToIndex],
  );

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTextInputTarget(event.target)) return;

      const baseIndex = getCurrentIndex();
      const shiftOnly =
        event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
      const noModifier =
        !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;

      if (noModifier && (event.key === "[" || event.key === "]")) {
        event.preventDefault();
        jumpToIndex(baseIndex + (event.key === "]" ? 1 : -1));
        return;
      }

      if (shiftOnly && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
        event.preventDefault();
        jumpToIndex(baseIndex + (event.key === "ArrowRight" ? 1 : -1));
        return;
      }

      if (shiftOnly && (event.key === "Home" || event.key === "End")) {
        event.preventDefault();
        jumpToIndex(event.key === "Home" ? 0 : columnCount - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [columnCount, getCurrentIndex, jumpToIndex]);

  return null;
}
