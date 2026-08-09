"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { FilterIslandChips } from "@/components/requests/filter/FilterIslandChips";
import { FilterIslandHeader } from "@/components/requests/filter/FilterIslandHeader";
import {
  FILTER_ISLAND_CONTENT_CLASS,
  FILTER_ISLAND_MAX_WIDTH_CLASS,
  FILTER_ISLAND_SHELL_CLASS,
} from "@/components/requests/filter/constants";
import { useFilterIslandController } from "@/components/requests/filter/useFilterIslandController";
import { getFilterIslandLabel } from "@/components/requests/filter/utils";
import { useActivePageFilters } from "@/hooks/useActivePageFilters";

export default function FilterDynamicIsland() {
  const { isVisible, count, items, preview, handleClearAll: clearAllFilters } =
    useActivePageFilters();

  const {
    collapse,
    expanded,
    islandRef,
    reduceMotion,
    toggleExpanded,
    transitions,
  } = useFilterIslandController({ isVisible });

  const handleClearAll = React.useCallback(() => {
    clearAllFilters();
    collapse();
  }, [clearAllFilters, collapse]);

  if (reduceMotion && !isVisible) return null;

  return (
    <AnimatePresence initial={false}>
      {isVisible ? (
        <motion.div
          key="filter-dynamic-island"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transitions.visibility}
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center"
          aria-live="polite"
        >
          <motion.div
            ref={islandRef}
            layout={!reduceMotion}
            transition={{ layout: transitions.layout }}
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label={getFilterIslandLabel(count, expanded)}
            className={cn(
              FILTER_ISLAND_SHELL_CLASS,
              "w-fit transform-gpu",
              FILTER_ISLAND_MAX_WIDTH_CLASS,
            )}
          >
            <div
              className={cn(FILTER_ISLAND_CONTENT_CLASS, "min-w-0 w-max max-w-full")}
            >
              <FilterIslandHeader
                count={count}
                expanded={expanded}
                preview={preview}
                onClearAll={handleClearAll}
              />

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  !reduceMotion && "motion-reduce:transition-none",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  {expanded ? <FilterIslandChips items={items} /> : null}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
