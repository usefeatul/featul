"use client";

import { XMarkIcon } from "@featul/ui/icons/xmark";
import {
  FILTER_ISLAND_CHIP_CLASS,
  FILTER_ISLAND_CHIPS_ROW_CLASS,
  FILTER_ISLAND_DIVIDER_CLASS,
} from "@/components/requests/filter-island/constants";
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
          <button
            key={item.key}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              item.onRemove();
            }}
            aria-label={`Remove ${item.label} filter`}
            className={FILTER_ISLAND_CHIP_CLASS}
          >
            <span className="truncate">{item.label}</span>
            <XMarkIcon className="size-2.5 shrink-0 text-white/60 dark:text-neutral-950/60" />
          </button>
        ))}
      </div>
    </>
  );
}
