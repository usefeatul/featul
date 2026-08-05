"use client";

import React from "react";
import { cn } from "@featul/ui/lib/utils";
import StatusIcon from "@/components/requests/StatusIcon";
import { ROADMAP_STATUSES, statusLabel } from "@/lib/roadmap";

export default function RoadmapColumnJump({
  onJump,
  activeStatus,
  counts,
  className,
}: {
  onJump: (status: string) => void;
  activeStatus?: string;
  counts: Record<string, number>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:hidden",
        className,
      )}
    >
      {(ROADMAP_STATUSES as readonly string[]).map((status) => (
        <button
          key={status}
          type="button"
          onClick={() => onJump(status)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors",
            activeStatus === status
              ? "border-foreground/20 bg-card text-foreground"
              : "border-border/70 bg-background text-accent hover:text-foreground",
          )}
        >
          <StatusIcon status={status} className="size-3.5" />
          <span>{statusLabel(status)}</span>
          <span className="font-mono tabular-nums text-[10px] opacity-70">
            {counts[status] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
