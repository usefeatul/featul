"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useMotionValue, useTransform, type MotionStyle, type PanInfo } from "framer-motion";
import { useIsomorphicLayoutEffect } from "@featul/ui/hooks/use-isomorphic-layout-effect";
import {
  PANEL_BASE_WIDTH as BASE_WIDTH,
  PANEL_MAX_WIDTH as MAX_WIDTH,
  PANEL_WIDTH_COOKIES,
  parsePanelWidth,
  type PanelKind,
} from "@/lib/panel";

/** Widths are in rem so resizing follows the same scale as the existing panels. */
export function usePanelResize(open: boolean, panel: PanelKind, initialWidth = BASE_WIDTH) {
  const panelRef = useRef<HTMLElement>(null);
  const width = useMotionValue(parsePanelWidth(initialWidth));
  const preferredWidth = useRef(parsePanelWidth(initialWidth));
  const cssWidth = useTransform(width, (value) => `${value}rem`);
  const [maxWidth, setMaxWidth] = useState(MAX_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const gesture = useRef<{ width: number; rem: number } | null>(null);

  useIsomorphicLayoutEffect(() => {
    // Fresh cookies take precedence over stale props from a prefetched route.
    try {
      const saved = document.cookie.split("; ")
        .find((cookie) => cookie.startsWith(`${PANEL_WIDTH_COOKIES[panel]}=`))
        ?.split("=")[1];
      if (saved !== undefined) {
        preferredWidth.current = parsePanelWidth(saved);
        width.set(preferredWidth.current);
      }
    } catch {
      // The server-provided width remains usable without cookie access.
    }
  }, [panel, width]);

  const saveWidth = () => {
    preferredWidth.current = width.get();
    try {
      document.cookie = `${PANEL_WIDTH_COOKIES[panel]}=${width.get()}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    } catch {
      // Resizing still works when cookies are blocked.
    }
  };

  useEffect(() => {
    const container = panelRef.current?.parentElement;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      // Leave at least 20rem for the editor where the viewport allows it.
      const limit = Math.max(BASE_WIDTH, Math.min(MAX_WIDTH, container.clientWidth / rem - 20));
      setMaxWidth(limit);
      // Responsive constraints must not overwrite the user's saved preference.
      width.set(Math.min(preferredWidth.current, limit));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    if (!open || !isResizing) return;
    const { cursor, userSelect } = document.body.style;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = cursor;
      document.body.style.userSelect = userSelect;
    };
  }, [open, isResizing]);

  const setWidth = (value: number) => width.set(Math.max(BASE_WIDTH, Math.min(maxWidth, value)));
  const finish = () => {
    if (gesture.current) saveWidth();
    gesture.current = null;
    setIsResizing(false);
  };

  return {
    panelRef,
    width,
    minWidth: BASE_WIDTH,
    maxWidth,
    isResizing,
    style: { "--resizable-panel-width": cssWidth } as MotionStyle,
    onPanStart: () => {
      gesture.current = {
        width: width.get(),
        rem: parseFloat(getComputedStyle(document.documentElement).fontSize) || 16,
      };
      setIsResizing(true);
    },
    onPan: (_event: PointerEvent, info: PanInfo) => {
      if (!open || !gesture.current) return;
      setWidth(gesture.current.width - info.offset.x / gesture.current.rem);
    },
    onPanEnd: finish,
    onPointerCancel: finish,
    onDoubleClick: () => {
      setWidth(BASE_WIDTH);
      saveWidth();
    },
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") setWidth(width.get() + 0.5);
      else if (event.key === "ArrowRight") setWidth(width.get() - 0.5);
      else if (event.key === "Home") setWidth(BASE_WIDTH);
      else if (event.key === "End") setWidth(maxWidth);
      else if (event.key === "Escape" && gesture.current) {
        setWidth(gesture.current.width);
        finish();
      } else return;
      event.preventDefault();
      saveWidth();
    },
  };
}
