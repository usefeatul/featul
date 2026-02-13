"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";

export default function RoadmapDraggable({
  id,
  children,
  className = "",
  isDragging = false,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  isDragging?: boolean;
}) {
  const { setNodeRef, listeners, attributes, transform } = useDraggable({ id });
  const sanitizedAttributes = React.useMemo(() => {
    const { ["aria-describedby"]: _omit, ...rest } = (attributes as any) || {};
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
      className={
        "overflow-hidden rounded-lg border border-border bg-background px-3 py-3 cursor-grab select-none active:cursor-grabbing " +
        (isDragging ? "opacity-0 " : "") +
        (className ? className : "")
      }
      layout
      transition={{ type: "spring", stiffness: 180, damping: 36 }}
    >
      {children}
    </motion.li>
  );
}
