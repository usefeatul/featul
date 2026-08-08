"use client";

import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import { cn } from "@featul/ui/lib/utils";
import {
  FILTER_ISLAND_CLEAR_ALL_CLASS,
  FILTER_ISLAND_MUTED_ICON_CLASS,
} from "@/components/requests/filter-island/constants";
import { getFilterPreviewSuffix } from "@/components/requests/filter-island/utils";

type FilterIslandHeaderProps = {
  count: number;
  expanded: boolean;
  preview: string;
  onClearAll: () => void;
};

export function FilterIslandHeader({
  count,
  expanded,
  preview,
  onClearAll,
}: FilterIslandHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-7 items-center whitespace-nowrap",
        expanded ? "w-full justify-between gap-3" : "gap-2",
      )}
    >
      <div className="flex shrink-0 items-center gap-2">
        <ListFilterIcon
          className={cn("size-3.5 shrink-0", FILTER_ISLAND_MUTED_ICON_CLASS)}
        />

        {!expanded ? (
          <span className="flex items-center gap-1.5 text-[11px] font-medium">
            <span className="tabular-nums text-white/90 dark:text-neutral-950/90">
              {count}
            </span>
            <span className="text-white/30 dark:text-neutral-950/30">·</span>
            <span className="text-white/75 dark:text-neutral-950/75">
              {preview}
              {getFilterPreviewSuffix(count)}
            </span>
          </span>
        ) : (
          <span className="text-[11px] font-medium text-white/85 dark:text-neutral-950/85">
            {count} filter{count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {expanded ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClearAll();
          }}
          className={FILTER_ISLAND_CLEAR_ALL_CLASS}
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
