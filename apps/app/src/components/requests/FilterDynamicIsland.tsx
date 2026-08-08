"use client";

import React from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { cn } from "@featul/ui/lib/utils";
import { useActivePageFilters } from "@/hooks/useActivePageFilters";

const EASE = [0.32, 0.72, 0, 1] as const;
const COLLAPSED_WIDTH = 184;
const EXPANDED_WIDTH = 352;

export default function FilterDynamicIsland() {
  const { isVisible, count, items, preview, handleClearAll } =
    useActivePageFilters();
  const [expanded, setExpanded] = React.useState(false);
  const islandRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (!expanded) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!islandRef.current?.contains(event.target as Node)) {
        setExpanded(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  React.useEffect(() => {
    if (!isVisible) {
      setExpanded(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const islandTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: EASE };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center"
      aria-live="polite"
    >
      <motion.div
        ref={islandRef}
        initial={false}
        animate={{
          width: expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        }}
        transition={islandTransition}
        style={{ originY: 0 }}
        className={cn(
          "pointer-events-auto transform-gpu overflow-hidden rounded-t-none rounded-b-md bg-neutral-950 text-white",
          "border border-t-0 border-white/10 shadow-[0_10px_32px_-14px_rgba(0,0,0,0.65)]",
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={
            expanded
              ? "Collapse active filters"
              : `${count} active filter${count === 1 ? "" : "s"}`
          }
          className="flex h-8 w-full items-center gap-2 px-3.5 text-left"
        >
          <ListFilterIcon className="size-3.5 shrink-0 text-white/65" />

          {!expanded ? (
            <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium">
              <span className="tabular-nums text-white/90">{count}</span>
              <span className="text-white/30">·</span>
              <span className="truncate text-white/75">
                {preview}
                {count > 2 ? ` +${count - 2}` : ""}
              </span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-white/55">
              Tap to collapse
            </span>
          )}
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-white/10 px-2.5 pb-2 pt-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      item.onRemove();
                    }}
                    className="inline-flex max-w-[9.5rem] items-center gap-1 rounded-full bg-white/12 px-2 py-0.5 text-[11px] text-white transition-colors hover:bg-white/20"
                  >
                    <span className="truncate">{item.label}</span>
                    <XMarkIcon className="size-2.5 shrink-0 text-white/55" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClearAll();
                    setExpanded(false);
                  }}
                  className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
