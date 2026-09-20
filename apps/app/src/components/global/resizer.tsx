"use client";

import { useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import type { usePanelResize } from "@/hooks/usePanelResize";

export function Resizer({
  resize,
  controls,
  label,
  className,
}: {
  resize: ReturnType<typeof usePanelResize>;
  controls: string;
  label: string;
  className?: string;
}) {
  const [width, setWidth] = useState(resize.width.get());
  useMotionValueEvent(resize.width, "change", setWidth);

  return (
    <motion.div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-controls={controls}
      aria-orientation="vertical"
      aria-valuemin={100}
      aria-valuemax={Math.round(resize.maxWidth / resize.minWidth * 100)}
      aria-valuenow={Math.round(width / resize.minWidth * 100)}
      aria-valuetext={`${Math.round(width / resize.minWidth * 100)}% width`}
      title="Drag left to widen · Double-click to reset"
      onPanStart={resize.onPanStart}
      onPan={resize.onPan}
      onPanEnd={resize.onPanEnd}
      onPointerCancel={resize.onPointerCancel}
      onDoubleClick={resize.onDoubleClick}
      onKeyDown={resize.onKeyDown}
      className={cn(
        "group/resizer absolute inset-y-0 left-0 z-30 flex w-3 cursor-col-resize touch-none select-none items-center justify-center outline-none",
        className,
      )}
    >
      <span className={cn(
        "absolute inset-y-0 left-0 w-px transition-colors group-hover/resizer:bg-primary/50 group-focus-visible/resizer:bg-primary motion-reduce:transition-none",
        resize.isResizing && "bg-primary/50",
      )} />
    </motion.div>
  );
}
