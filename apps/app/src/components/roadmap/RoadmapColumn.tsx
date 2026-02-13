"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { MoveVerticalIcon } from "@featul/ui/icons/vertical";
import { MoveHorizontalIcon } from "@featul/ui/icons/horizontal";
import StatusIcon from "@/components/requests/StatusIcon";
import { motion, AnimatePresence } from "framer-motion";

export default function RoadmapColumn({
  id,
  label,
  count,
  collapsed,
  onToggle,
  children,
  disableMotion,
}: {
  id: string;
  label: string;
  count: number;
  collapsed?: boolean;
  onToggle?: (next: boolean) => void;
  children: React.ReactNode;
  disableMotion?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      className={`overflow-hidden rounded-lg border border-border bg-card transition-colors duration-200 ${isOver ? "border-primary/60" : ""}`}
      layout
      initial={false}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: disableMotion ? 0 : 0.28,
      }}
    >
      <div
        className={`${collapsed ? "relative flex flex-col items-center gap-2 px-2 py-3" : "flex items-center justify-between border-b border-border px-3 py-2.5"} cursor-pointer`}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={() => onToggle?.(!collapsed)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onToggle?.(!collapsed);
        }}
      >
        {collapsed ? (
          <>
            <MoveVerticalIcon className="mx-auto block size-3 text-accent" />
            <StatusIcon
              status={id}
              className="mx-auto block size-4.5 text-foreground/80"
            />
            <div className="text-[11px] uppercase text-accent">{label}</div>
            <div className="mx-auto block rounded border border-border bg-background px-2 py-0.5 text-xs font-mono tabular-nums text-accent">
              {count}
            </div>
          </>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <StatusIcon
                status={id}
                className="size-4 text-foreground/80 shrink-0"
              />
              <div className="truncate text-sm font-medium">{label}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded border border-border bg-background px-2 py-0.5 text-xs font-mono tabular-nums text-accent">
                {count}
              </div>
              <MoveHorizontalIcon className="size-3 text-accent" />
            </div>
          </>
        )}
      </div>
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.ul
            className="min-h-24 space-y-2 p-2.5"
            initial={false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "tween",
              ease: [0.22, 1, 0.36, 1],
              duration: disableMotion ? 0 : 0.32,
            }}
          >
            {children}
            {isOver ? (
              <motion.li
                className="mt-2 rounded-lg border-2 border-dashed border-primary/50"
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: disableMotion ? 0 : 0.08 }}
              />
            ) : null}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
