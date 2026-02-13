"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { MoveVerticalIcon } from "@featul/ui/icons/vertical";
import { MoveHorizontalIcon } from "@featul/ui/icons/horizontal";
import { FillPlusIcon } from "@featul/ui/icons/fill-plus";
import { Button } from "@featul/ui/components/button";
import StatusIcon from "@/components/requests/StatusIcon";
import { motion, AnimatePresence } from "framer-motion";

export default function RoadmapColumn({
  id,
  label,
  count,
  collapsed,
  onToggle,
  onCreate,
  children,
  disableMotion,
}: {
  id: string;
  label: string;
  count: number;
  collapsed?: boolean;
  onToggle?: (next: boolean) => void;
  onCreate?: () => void;
  children: React.ReactNode;
  disableMotion?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      className={`overflow-hidden rounded-md border border-border bg-card ring-1 ring-border/60 ring-offset-1 ring-offset-white dark:ring-offset-black transition-colors duration-200 ${isOver ? "border-green-500 ring-green-500/30" : ""}`}
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
        aria-label={collapsed ? `${label} column, ${count} posts` : undefined}
        title={collapsed ? label : undefined}
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
            <div className="mx-auto block px-1 text-xs font-mono tabular-nums text-accent">
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
              {onCreate ? (
                <Button
                  type="button"
                  variant="plain"
                  size="icon-sm"
                  className="group h-6 w-6 rounded-md border-0 !bg-transparent px-0 text-accent shadow-none hover:!bg-transparent hover:text-foreground"
                  aria-label={`Create post in ${label}`}
                  title={`Create post in ${label}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCreate();
                  }}
                >
                  <FillPlusIcon className="size-3.5" size={14} />
                </Button>
              ) : null}
              <div className="inline-flex h-6 min-w-6 items-center justify-center px-1.5 text-xs font-mono tabular-nums leading-none text-accent">
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
                className="mt-2 rounded-md border-2 border-dashed border-green-500"
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
