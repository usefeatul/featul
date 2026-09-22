"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
        "h-[108px] cursor-grab overflow-hidden rounded-lg bg-muted/55 shadow-none ring-1 ring-border/40 transition-[background-color,box-shadow,opacity] hover:bg-muted/80 hover:ring-border/70 active:cursor-grabbing dark:bg-white/[0.035] dark:ring-white/[0.055] dark:hover:bg-white/[0.055] dark:hover:ring-white/[0.09]",
        isSaving && "opacity-80 ring-primary/60",
        isDragging && "opacity-0",
        className,
      )}
    >
      <div className="flex h-full min-w-0 flex-col">{children}</div>
    </li>
  );
}
