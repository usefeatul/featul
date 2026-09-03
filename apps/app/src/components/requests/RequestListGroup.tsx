"use client";

import React from "react";
import { cn } from "@featul/ui/lib/utils";
import { ChevronDownIcon } from "@featul/ui/icons/chevron-down";
import StatusIcon from "./StatusIcon";
import { normalizeRoadmapStatus, statusLabel } from "@/lib/roadmap";
import type { RequestItemData } from "@/types/request";

const REQUEST_LIST_STATUS_ORDER = [
  "pending",
  "review",
  "planned",
  "progress",
  "completed",
  "closed",
] as const;

export function groupRequestsByStatus(items: RequestItemData[]) {
  const buckets = new Map<string, RequestItemData[]>();
  for (const status of REQUEST_LIST_STATUS_ORDER) {
    buckets.set(status, []);
  }

  for (const item of items) {
    const key = normalizeRoadmapStatus(item.roadmapStatus);
    const list = buckets.get(key);
    if (list) list.push(item);
    else buckets.get("pending")?.push(item);
  }

  return REQUEST_LIST_STATUS_ORDER.map((status) => ({
    status,
    items: buckets.get(status) ?? [],
  })).filter((group) => group.items.length > 0);
}

export function RequestListGroup({
  status,
  count,
  collapsed,
  sticky,
  className,
  onToggle,
  children,
}: {
  status: string;
  count: number;
  collapsed: boolean;
  sticky?: boolean;
  className?: string;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const label = statusLabel(status);

  return (
    <section
      className={cn(
        "min-w-0",
        !collapsed && "border-b border-border/40 dark:border-white/10",
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className={cn(
          "flex h-9 w-full items-center gap-2 px-3 text-left sm:px-4",
          "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
          sticky && "sticky top-0 z-[1] bg-background/95 backdrop-blur-sm",
        )}
      >
        <ChevronDownIcon
          className={cn(
            "size-3 shrink-0 transition-transform",
            collapsed && "-rotate-90",
          )}
        />
        <StatusIcon status={status} className="size-3.5 shrink-0" />
        <span className="font-heading text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs tabular-nums">{count}</span>
      </button>
      {collapsed ? null : children}
    </section>
  );
}
