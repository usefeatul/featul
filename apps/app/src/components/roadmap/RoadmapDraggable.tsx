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
        "group/card relative h-[152px] overflow-hidden rounded-md border border-border bg-background shadow-xs transition-[border-color,box-shadow,opacity] hover:border-foreground/20 hover:shadow-sm dark:hover:border-white/15",
        isSaving && "border-primary/60 opacity-80",
        isDragging && "opacity-0",
        className,
      )}
      layout
      transition={{ type: "spring", stiffness: 180, damping: 36 }}
    >
      <button
        type="button"
        {...listeners}
        {...sanitizedAttributes}
        className="absolute right-1.5 top-1.5 z-10 flex size-6 cursor-grab items-center justify-center rounded-md text-accent/45 opacity-0 transition-[opacity,background-color,color] hover:bg-muted/70 hover:text-accent group-hover/card:opacity-100 active:cursor-grabbing"
        aria-label="Drag to move card"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <GripVertical className="size-3.5" strokeWidth={2} />
      </button>
      <div className="h-full min-w-0">{children}</div>
    </motion.li>
  );
}
