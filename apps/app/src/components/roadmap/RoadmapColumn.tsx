"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { MoveVerticalIcon } from "@featul/ui/icons/vertical";
import { MoveHorizontalIcon } from "@featul/ui/icons/horizontal";
import { FillPlusIcon } from "@featul/ui/icons/fill-plus";
import { Button } from "@featul/ui/components/button";
import { OverlayChip } from "@featul/ui/components/overlay-chip";
import { overlayInnerClass, overlayShellClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import StatusIcon from "@/components/requests/StatusIcon";
import RoadmapEmptyColumn from "@/components/roadmap/RoadmapEmptyColumn";
import {
  settingsCardInnerClass,
  settingsCardShellClass,
} from "@/components/settings/global/SectionCard";
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
  onCreate?: (status: string) => void;
  children: React.ReactNode;
  disableMotion?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      className={cn(
        settingsCardShellClass,
        "h-full transition-colors duration-200",
        isOver && "border-green-500/70 dark:border-green-500/70",
      )}
      layout
      initial={false}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: disableMotion ? 0 : 0.28,
      }}
    >
      <div
        className={`${collapsed ? "relative flex flex-col items-center gap-2 px-2 py-3" : "flex items-center justify-between px-2 py-2"} cursor-pointer`}
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
            <MoveHorizontalIcon className="mx-auto block size-4 text-accent" />
            <StatusIcon
              status={id}
              className="mx-auto block size-4.5 text-foreground/80"
            />
            <OverlayChip className="mx-auto" innerClassName="min-w-5 px-1.5">
              {count}
            </OverlayChip>
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
                    onCreate(id);
                  }}
                >
                  <FillPlusIcon className="size-4" size={16} />
                </Button>
              ) : null}
              <OverlayChip innerClassName="min-w-5 px-1.5">
                {count}
              </OverlayChip>
              <MoveVerticalIcon className="size-4 text-accent" />
            </div>
          </>
        )}
      </div>
      <AnimatePresence initial={false}>
        {!collapsed ? (
          <motion.ul
            className={cn(
              settingsCardInnerClass,
              "min-h-[260px] space-y-2 overflow-y-auto p-2",
            )}
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
            {count === 0 && !isOver ? (
              <RoadmapEmptyColumn
                label={label}
                onCreate={onCreate ? () => onCreate(id) : undefined}
              />
            ) : null}
            {isOver ? (
              <motion.li
                className={cn(overlayShellClass, "mt-2 h-16 border-dashed border-green-500/70 p-1")}
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: disableMotion ? 0 : 0.08 }}
              >
                <div className={cn(overlayInnerClass, "h-full bg-green-500/[0.04]")} />
              </motion.li>
            ) : null}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
