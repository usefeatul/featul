"use client";

import {
  AnimatePresence,
  motion,
  type Transition,
} from "framer-motion";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { FILTER_ISLAND_CHIP_CLASS, FILTER_ISLAND_DIVIDER_CLASS } from "@/components/requests/filter-island/constants";
import type { ActiveFilterItem } from "@/hooks/useActivePageFilters";

type FilterIslandChipsProps = {
  expanded: boolean;
  items: ActiveFilterItem[];
  transition: Transition;
};

export function FilterIslandChips({
  expanded,
  items,
  transition,
}: FilterIslandChipsProps) {
  return (
    <AnimatePresence initial={false}>
      {expanded ? (
        <motion.div
          key="filter-chips"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={transition}
          className="overflow-hidden"
        >
          <div
            aria-hidden
            className={FILTER_ISLAND_DIVIDER_CLASS}
          />
          <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2.5 pt-2">
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
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
