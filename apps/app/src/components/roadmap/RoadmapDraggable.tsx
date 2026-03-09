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
      className={
        "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_1px_3px_rgba(15,23,42,0.09)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] hover:border-border hover:shadow-[0_10px_22px_rgba(15,23,42,0.09)] dark:hover:border-white/15 dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.68),0_0_0_1px_rgba(255,255,255,0.05)] cursor-grab select-none active:cursor-grabbing " +
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
