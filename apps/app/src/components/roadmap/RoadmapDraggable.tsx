"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { Checkbox } from "@featul/ui/components/checkbox";

export default function RoadmapDraggable({
  id,
  children,
  className = "",
  isDragging = false,
  isSaving = false,
  isSelecting = false,
  isSelected = false,
  onToggleSelect,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  isDragging?: boolean;
  isSaving?: boolean;
  isSelecting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (checked: boolean) => void;
}) {
  const {
    setNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id, disabled: isSelecting });

  const sanitizedAttributes = React.useMemo(() => {
    if (!attributes) return {};
    const { ["aria-describedby"]: _omit, ...rest } = attributes;
    return rest;
  }, [attributes]);

  return (
    <motion.li
      ref={setNodeRef}
      {...(!isSelecting ? listeners : {})}
      {...(!isSelecting ? sanitizedAttributes : {})}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "group/card relative h-[152px] overflow-hidden rounded-md border border-border bg-background shadow-xs transition-[border-color,box-shadow,opacity] hover:border-foreground/20 hover:shadow-sm dark:hover:border-white/15",
        !isSelecting && "cursor-grab active:cursor-grabbing",
        isSaving && "border-primary/60 opacity-80",
        (isDragging || isSortableDragging) && "opacity-0",
        isSelected && "border-primary/50 ring-1 ring-primary/20",
        className,
      )}
      layout
    >
      {isSelecting ? (
        <div className="absolute left-2 top-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(value) => onToggleSelect?.(Boolean(value))}
            aria-label="Select card"
            onClick={(event) => event.stopPropagation()}
            className="cursor-pointer border-border data-[state=checked]:border-primary"
          />
        </div>
      ) : null}
      <div className="h-full min-w-0">{children}</div>
    </motion.li>
  );
}
