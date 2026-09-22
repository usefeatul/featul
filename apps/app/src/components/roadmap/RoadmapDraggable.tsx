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
        "h-[108px] cursor-grab overflow-hidden rounded-lg border border-border/70 bg-card shadow-none transition-[background-color,border-color,opacity] hover:border-border active:cursor-grabbing dark:border-white/[0.08] dark:hover:border-white/[0.14]",
        isSaving && "border-primary/60 opacity-80",
        isDragging && "opacity-0",
        className,
      )}
    >
      <div className="flex h-full min-w-0 flex-col">{children}</div>
    </li>
  );
}
