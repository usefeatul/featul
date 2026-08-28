import type { Transition } from "framer-motion";

export const FILTER_ISLAND_EASE = [0.32, 0.72, 0, 1] as const;

export const FILTER_ISLAND_MAX_WIDTH_CLASS =
  "max-w-[min(32rem,calc(100vw-6rem))]";

export const FILTER_ISLAND_EXPANDED_MIN_WIDTH_CLASS = "min-w-[20rem]";

export const FILTER_ISLAND_SHELL_CLASS =
  "cursor-pointer overflow-hidden rounded-xl border border-border bg-card p-1 text-foreground dark:border-white/10 dark:bg-black";

export const FILTER_ISLAND_MUTED_ICON_CLASS = "text-muted-foreground";

export const FILTER_ISLAND_BUTTON_HOVER_CLASS =
  "cursor-pointer transition-colors hover:bg-muted/20 hover:text-accent-foreground dark:hover:bg-black/30";

export const FILTER_ISLAND_CLEAR_ALL_CLASS =
  "inline-flex h-full cursor-pointer items-center justify-center whitespace-nowrap px-2 text-[11px] font-medium";

export const FILTER_ISLAND_CHIP_CLASS =
  "inline-flex h-full min-w-fit cursor-pointer items-center gap-1.5 whitespace-nowrap px-2 text-[11px] font-medium";

export const FILTER_ISLAND_CHIP_SHELL_CLASS =
  "flex w-fit min-w-fit shrink-0 items-stretch rounded-xl border border-border bg-card p-0.5 text-foreground dark:border-white/10 dark:bg-black";

export const FILTER_ISLAND_CHIP_INNER_CLASS =
  "flex h-6 min-h-6 min-w-fit items-stretch overflow-hidden rounded-md bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-card dark:ring-white/10 dark:ring-offset-black";

export const FILTER_ISLAND_CONTENT_CLASS =
  "inline-flex w-max min-w-0 max-w-full flex-col overflow-hidden rounded-lg bg-background ring-1 ring-border/60 ring-offset-1 ring-offset-card dark:ring-white/10 dark:ring-offset-black";

export const FILTER_ISLAND_INSET_X_CLASS = "px-2.5";

export const FILTER_ISLAND_CHIPS_ROW_CLASS =
  "flex flex-wrap items-center gap-2 px-2 pb-2 pt-1.5";

export const FILTER_ISLAND_DIVIDER_CLASS =
  "mx-1 h-px bg-border dark:bg-white/10";

export type FilterIslandTransitions = {
  layout: Transition;
  visibility: Transition;
};

/** Instant transitions when reduced-motion is on. Else the island ease curve. */
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
