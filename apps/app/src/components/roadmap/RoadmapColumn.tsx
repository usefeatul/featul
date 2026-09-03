"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useReducedMotion } from "framer-motion";
import { MoveVerticalIcon } from "@featul/ui/icons/vertical";
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

const COLUMN_MOTION_MS = 550;

export const ROADMAP_COLUMN_WIDTH_TRANSITION_CLASS =
  "md:transition-[flex-grow,flex-shrink,flex-basis,min-width] md:duration-[550ms] md:ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none";

export function roadmapColumnWidthClass(collapsed: boolean) {
  return collapsed
    ? "md:min-w-20 md:flex-[0_0_80px]"
    : "md:min-w-[300px] md:flex-[1_1_0px] lg:min-w-[320px]";
}

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
  const reduceMotion = useReducedMotion() ?? false;
  const instant = Boolean(disableMotion || reduceMotion);
  const [contentMounted, setContentMounted] = React.useState(!collapsed);
  const showContent = !collapsed || contentMounted;

  React.useEffect(() => {
    if (!collapsed) {
      setContentMounted(true);
      return;
    }
    const delay = instant ? 0 : COLUMN_MOTION_MS;
    const timeoutId = window.setTimeout(() => setContentMounted(false), delay);
    return () => window.clearTimeout(timeoutId);
  }, [collapsed, instant]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        settingsCardShellClass,
        "h-full transition-colors duration-200",
        isOver && "border-green-500/70 dark:border-green-500/70",
      )}
    >
      <div
        className={cn(
          "cursor-pointer",
          collapsed
            ? "relative flex flex-col items-center gap-2 px-2 py-3"
            : "flex items-center justify-between px-2 py-2",
        )}
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
            <MoveVerticalIcon
              className={cn(
                "mx-auto block size-4 rotate-90 text-accent transition-transform duration-[550ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                instant && "transition-none",
              )}
            />
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
              <MoveVerticalIcon
                className={cn(
                  "size-4 text-accent transition-transform duration-[550ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                  instant && "transition-none",
                )}
              />
            </div>
          </>
        )}
      </div>
      <div
        className={cn(
          "grid min-h-0 flex-1",
          instant
            ? "transition-none"
            : "transition-[grid-template-rows,opacity] duration-[550ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
          collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
        )}
        aria-hidden={collapsed}
        inert={!!collapsed}
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <ul
            className={cn(
              settingsCardInnerClass,
              "min-h-[260px] min-h-0 flex-1 space-y-2 overflow-y-auto p-2",
            )}
          >
            {showContent ? children : null}
            {showContent && count === 0 && !isOver ? (
              <RoadmapEmptyColumn
                label={label}
                onCreate={onCreate ? () => onCreate(id) : undefined}
              />
            ) : null}
            {isOver ? (
              <li
                className={cn(
                  overlayShellClass,
                  "mt-2 h-16 border-dashed border-green-500/70 p-1",
                )}
                aria-hidden
              >
                <div
                  className={cn(overlayInnerClass, "h-full bg-green-500/[0.04]")}
                />
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
