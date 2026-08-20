"use client";

import { XMarkIcon } from "@featul/ui/icons/xmark";
import { cn } from "@featul/ui/lib/utils";
import {
  FILTER_ISLAND_BUTTON_HOVER_CLASS,
  FILTER_ISLAND_CHIP_CLASS,
  FILTER_ISLAND_CHIP_INNER_CLASS,
  FILTER_ISLAND_CHIP_SHELL_CLASS,
  FILTER_ISLAND_CHIPS_ROW_CLASS,
  FILTER_ISLAND_DIVIDER_CLASS,
} from "@/components/requests/filter/constants";
import type { ActiveFilterItem } from "@/hooks/useActivePageFilters";

type FilterIslandChipsProps = {
  items: ActiveFilterItem[];
};

export function FilterIslandChips({ items }: FilterIslandChipsProps) {
  return (
    <>
      <div aria-hidden className={FILTER_ISLAND_DIVIDER_CLASS} />
      <div className={FILTER_ISLAND_CHIPS_ROW_CLASS}>
        {items.map((item) => (
          <div key={item.key} className={FILTER_ISLAND_CHIP_SHELL_CLASS}>
            <div className={FILTER_ISLAND_CHIP_INNER_CLASS}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  item.onRemove();
                }}
                aria-label={`Remove ${item.label} filter`}
                className={cn(
                  "h-full rounded-none border-none bg-transparent shadow-none ring-0 ring-offset-0",
                  FILTER_ISLAND_CHIP_CLASS,
                  FILTER_ISLAND_BUTTON_HOVER_CLASS,
                )}
              >
                <span>{item.label}</span>
                <XMarkIcon className="size-2.5 shrink-0 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
