"use client";

import { useCallback, useState } from "react";

type ContextMenuPosition = {
  x: number;
  y: number;
};

/** Context-menu open state and cursor coordinates from a right-click. */
export function useContextMenuPosition() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const openAt = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setPosition({ x: event.clientX, y: event.clientY });
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
  }, []);

  return {
    open,
    position,
    openAt,
    close,
    setOpen,
    handleOpenChange,
  };
}
