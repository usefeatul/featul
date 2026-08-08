"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { FilterIslandChips } from "@/components/requests/filter-island/FilterIslandChips";
import { FilterIslandHeader } from "@/components/requests/filter-island/FilterIslandHeader";
import {
  FILTER_ISLAND_MAX_WIDTH_CLASS,
  FILTER_ISLAND_SHELL_CLASS,
} from "@/components/requests/filter-island/constants";
import { useFilterIslandController } from "@/components/requests/filter-island/useFilterIslandController";
import { getFilterIslandLabel } from "@/components/requests/filter-island/utils";
import { useActivePageFilters } from "@/hooks/useActivePageFilters";

export default function FilterDynamicIsland() {
  const { isVisible, count, items, preview, handleClearAll: clearAllFilters } =
    useActivePageFilters();

  const measureKey = React.useMemo(
    () => items.map((item) => item.key).join("|"),
    [items],
  );

  const {
    collapse,
    contentRef,
    expanded,
    islandRef,
    reduceMotion,
    toggleExpanded,
    transitions,
    width,
  } = useFilterIslandController({
    isVisible,
    measureKey: `${measureKey}:${count}:${preview}`,
  });

  const handleClearAll = React.useCallback(() => {
    clearAllFilters();
    collapse();
  }, [clearAllFilters, collapse]);

  if (reduceMotion && !isVisible) return null;

  return (
    <AnimatePresence initial={false}>
      {isVisible ? (
        <div
          key="filter-dynamic-island"
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center"
          aria-live="polite"
        >
          <motion.div
            ref={islandRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0, width: width ?? "auto" }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              opacity: transitions.visibility,
              y: transitions.visibility,
              width: transitions.island,
            }}
            style={{ originY: 0 }}
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={getFilterIslandLabel(count, expanded)}
            className={FILTER_ISLAND_SHELL_CLASS}
          >
            <div
              ref={contentRef}
              className={cn(
                "inline-flex w-max flex-col pt-2",
                FILTER_ISLAND_MAX_WIDTH_CLASS,
              )}
            >
              <FilterIslandHeader
                count={count}
                expanded={expanded}
                preview={preview}
                onClearAll={handleClearAll}
              />

              <FilterIslandChips
                expanded={expanded}
                items={items}
                transition={transitions.content}
              />
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
