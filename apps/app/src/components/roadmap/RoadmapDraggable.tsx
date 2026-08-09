"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";

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
      {...listeners}
      {...sanitizedAttributes}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      className={cn(
        "h-[152px] cursor-grab overflow-hidden rounded-md border border-border bg-background shadow-xs transition-[border-color,box-shadow,opacity] hover:border-foreground/20 hover:shadow-sm active:cursor-grabbing dark:hover:border-white/15",
        isSaving && "border-primary/60 opacity-80",
        isDragging && "opacity-0",
        className,
      )}
      layout
      transition={{ type: "spring", stiffness: 180, damping: 36 }}
    >
      <div className="h-full min-w-0">{children}</div>
    </motion.li>
  );
}
