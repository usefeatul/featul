"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay";
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
    <li
      ref={setNodeRef}
      {...listeners}
      {...sanitizedAttributes}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      className={cn(
        overlayShellClass,
        "h-[152px] cursor-grab p-1 shadow-none transition-[border-color,opacity] hover:border-foreground/20 active:cursor-grabbing dark:hover:border-white/15",
        isSaving && "border-primary/60 opacity-80",
        isDragging && "opacity-0",
        className,
      )}
    >
      <div className={cn(overlayInnerClass, "flex h-full min-w-0 flex-col")}>
        {children}
      </div>
    </li>
  );
}
