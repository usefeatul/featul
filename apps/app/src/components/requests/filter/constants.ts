import type { Transition } from "framer-motion";

export const FILTER_ISLAND_EASE = [0.32, 0.72, 0, 1] as const;

export const FILTER_ISLAND_MAX_WIDTH_CLASS =
  "max-w-[min(22rem,calc(100vw-8rem))]";

export const FILTER_ISLAND_SHELL_CLASS =
  "cursor-pointer overflow-hidden rounded-xl border border-border bg-card p-1 text-foreground dark:border-white/10 dark:bg-black";

export const FILTER_ISLAND_MUTED_ICON_CLASS = "text-muted-foreground";

export const FILTER_ISLAND_CLEAR_ALL_CLASS =
  "h-6 shrink-0 rounded-sm px-2 text-[11px] font-medium";

export const FILTER_ISLAND_CHIP_CLASS =
  "inline-flex h-6 max-w-[9rem] cursor-pointer items-center gap-1.5 rounded-md px-2 text-[11px] leading-none text-foreground transition-colors hover:bg-muted/40 dark:hover:bg-muted/30";

export const FILTER_ISLAND_CONTENT_CLASS =
  "inline-flex w-max min-w-0 max-w-full flex-col overflow-hidden rounded-lg bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-card dark:ring-white/10 dark:ring-offset-black";

export const FILTER_ISLAND_INSET_X_CLASS = "px-2.5";

export const FILTER_ISLAND_CHIPS_ROW_CLASS =
  "flex flex-wrap items-center gap-1.5 px-2.5 pb-1.5 pt-1.5";

export const FILTER_ISLAND_DIVIDER_CLASS = "w-full border-t border-border";

export type FilterIslandTransitions = {
  layout: Transition;
  visibility: Transition;
};

export function getFilterIslandTransitions(
  reduceMotion: boolean | null,
): FilterIslandTransitions {
  if (reduceMotion) {
    return {
      layout: { duration: 0 },
      visibility: { duration: 0 },
    };
  }

  return {
    layout: { duration: 0.28, ease: FILTER_ISLAND_EASE },
    visibility: { duration: 0.28, ease: FILTER_ISLAND_EASE },
  };
}
