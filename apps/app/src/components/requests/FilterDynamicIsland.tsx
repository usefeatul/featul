"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { ListFilterIcon } from "@featul/ui/icons/list-filter";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { cn } from "@featul/ui/lib/utils";
import { useActivePageFilters } from "@/hooks/useActivePageFilters";

const EASE = [0.32, 0.72, 0, 1] as const;

export default function FilterDynamicIsland() {
  const { isVisible, count, items, preview, handleClearAll } =
    useActivePageFilters();
  const [expanded, setExpanded] = React.useState(false);
  const islandRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState<number>();
  const reduceMotion = useReducedMotion();

  const itemKeys = React.useMemo(
    () => items.map((item) => item.key).join("|"),
    [items],
  );

  const toggleExpanded = React.useCallback(() => {
    setExpanded((value) => !value);
  }, []);

  React.useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const measure = () => {
      const next = Math.ceil(node.getBoundingClientRect().width);
      setWidth((current) => (current === next ? current : next));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [expanded, count, preview, itemKeys]);

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

  const contentTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: EASE };

  const islandLabel = expanded
    ? "Collapse active filters"
    : `${count} active filter${count === 1 ? "" : "s"}`;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center"
      aria-live="polite"
    >
      <motion.div
        ref={islandRef}
        initial={false}
        animate={{ width: width ?? "auto" }}
        transition={islandTransition}
        onClick={toggleExpanded}
        aria-expanded={expanded}
        aria-label={islandLabel}
        className={cn(
          "pointer-events-auto cursor-pointer overflow-hidden rounded-t-none rounded-b-md",
          "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950",
          "border border-t-0 border-white/10 dark:border-black/10",
          "shadow-[0_10px_32px_-14px_rgba(0,0,0,0.65)] dark:shadow-[0_10px_32px_-14px_rgba(0,0,0,0.2)]",
        )}
      >
        <div
          ref={contentRef}
          className="inline-flex w-max max-w-[min(24rem,calc(100vw-2rem))] flex-col px-3 pt-2"
        >
          <div
            className={cn(
              "flex h-7 items-center whitespace-nowrap",
              expanded ? "w-full justify-between gap-3" : "gap-2",
            )}
          >
            <div className="flex shrink-0 items-center gap-2">
              <ListFilterIcon className="size-3.5 shrink-0 text-white/70 dark:text-neutral-950/70" />

              {!expanded ? (
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="tabular-nums text-white/90 dark:text-neutral-950/90">
                    {count}
                  </span>
                  <span className="text-white/30 dark:text-neutral-950/30">
                    ·
                  </span>
                  <span className="text-white/75 dark:text-neutral-950/75">
                    {preview}
                    {count > 2 ? ` +${count - 2}` : ""}
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
                  handleClearAll();
                  setExpanded(false);
                }}
                className="shrink-0 cursor-pointer rounded-sm px-1.5 py-0.5 text-[11px] font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white dark:text-neutral-950/55 dark:hover:bg-black/8 dark:hover:text-neutral-950"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                key="filter-chips"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={contentTransition}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-1.5 pb-2.5 pt-2">
                  {items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        item.onRemove();
                      }}
                      aria-label={`Remove ${item.label} filter`}
                      className="inline-flex h-6 max-w-[8.5rem] cursor-pointer items-center gap-1 rounded-sm border border-white/10 bg-white/10 px-2 text-[11px] text-white transition-colors hover:bg-white/18 dark:border-black/10 dark:bg-black/8 dark:text-neutral-950 dark:hover:bg-black/12"
                    >
                      <span className="truncate">{item.label}</span>
                      <XMarkIcon className="size-2.5 shrink-0 text-white/60 dark:text-neutral-950/60" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
