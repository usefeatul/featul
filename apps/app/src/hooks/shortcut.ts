"use client";

import { useEffect, useRef } from "react";

export const PANEL_SHORTCUT_LABEL = "⌘/Ctrl + \\";
export const PANEL_ARIA_SHORTCUTS = "Meta+\\ Control+\\";

export function usePanelShortcut(onToggle: () => void) {
  const onToggleRef = useRef(onToggle);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isPanelShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        (event.code === "Backslash" || event.key === "\\");

      if (!isPanelShortcut || event.repeat || event.defaultPrevented) return;

      event.preventDefault();
      onToggleRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
