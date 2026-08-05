"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { GripVertical } from "lucide-react";

export default function RoadmapDraggable({
  id,
  children,
  className = "",
  isDragging = false,
  isSaving = false,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  isDragging?: boolean;
  isSaving?: boolean;
}) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({ id });
  const sanitizedAttributes = React.useMemo(() => {
    if (!attributes) return {};
    const { ["aria-describedby"]: _omit, ...rest } = attributes;
    return rest;
  }, [attributes]);

  return (
    <motion.li
      ref={setNodeRef}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      className={cn(
        "h-[152px] overflow-hidden rounded-md border border-border bg-background shadow-xs transition-[border-color,box-shadow,opacity] hover:border-foreground/20 hover:shadow-sm dark:hover:border-white/15",
        isSaving && "border-primary/60 opacity-80",
        isDragging && "opacity-0",
        className,
      )}
      layout
      transition={{ type: "spring", stiffness: 180, damping: 36 }}
    >
      <div className="flex h-full min-w-0">
        <button
          type="button"
          {...listeners}
          {...sanitizedAttributes}
          className="group/handle flex w-6 shrink-0 cursor-grab items-center justify-center border-r border-border/40 text-accent/35 transition-colors hover:bg-muted/30 hover:text-accent/70 active:cursor-grabbing"
          aria-label="Drag to move card"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <GripVertical className="size-3.5 opacity-70 transition-opacity group-hover/handle:opacity-100" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </motion.li>
  );
}
