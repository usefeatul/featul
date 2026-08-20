"use client";

import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import { toolbarItemClass } from "@featul/ui/components/toolbar";
import { cn } from "@featul/ui/lib/utils";
import {
  FILTER_ISLAND_BUTTON_HOVER_CLASS,
  FILTER_ISLAND_CHIP_INNER_CLASS,
  FILTER_ISLAND_CHIP_SHELL_CLASS,
  FILTER_ISLAND_CLEAR_ALL_CLASS,
  FILTER_ISLAND_INSET_X_CLASS,
  FILTER_ISLAND_MUTED_ICON_CLASS,
} from "@/components/requests/filter/constants";
import { getFilterPreviewSuffix } from "@/components/requests/filter/utils";

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
        "flex h-8 items-center whitespace-nowrap",
        FILTER_ISLAND_INSET_X_CLASS,
        expanded ? "w-full justify-between gap-2" : "gap-1.5",
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <ListFilterIcon
          className={cn("size-3 shrink-0", FILTER_ISLAND_MUTED_ICON_CLASS)}
        />

        {!expanded ? (
          <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium">
            <span className="tabular-nums text-foreground">{count}</span>
            <span className="text-border">·</span>
            <span className="truncate text-muted-foreground">
              {preview}
              {getFilterPreviewSuffix(count)}
            </span>
          </span>
        ) : (
          <span className="text-[11px] font-medium text-foreground">
            {count} filter{count === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {expanded ? (
        <div
          className={cn(FILTER_ISLAND_CHIP_SHELL_CLASS, "max-w-none")}
          onClick={(event) => event.stopPropagation()}
        >
          <div className={FILTER_ISLAND_CHIP_INNER_CLASS}>
            <button
              type="button"
              onClick={onClearAll}
              className={cn(
                toolbarItemClass,
                FILTER_ISLAND_CLEAR_ALL_CLASS,
                FILTER_ISLAND_BUTTON_HOVER_CLASS,
              )}
            >
              Clear all
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
