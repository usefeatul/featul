import type { Transition } from "framer-motion";

export const FILTER_ISLAND_EASE = [0.32, 0.72, 0, 1] as const;

export const FILTER_ISLAND_MAX_WIDTH_CLASS =
  "max-w-full";

export const FILTER_ISLAND_EXPANDED_MIN_WIDTH_CLASS = "w-80 min-w-0";

export const FILTER_ISLAND_SHELL_CLASS =
  "cursor-pointer overflow-hidden rounded-md bg-black/5 text-foreground dark:bg-[#292929]";

export const FILTER_ISLAND_MUTED_ICON_CLASS = "text-muted-foreground";

export const FILTER_ISLAND_BUTTON_HOVER_CLASS =
  "cursor-pointer transition-colors hover:bg-muted/20 hover:text-accent-foreground dark:hover:bg-black/30";

export const FILTER_ISLAND_CLEAR_ALL_CLASS =
  "inline-flex h-full cursor-pointer items-center justify-center whitespace-nowrap px-2 text-[11px] font-medium";

export const FILTER_ISLAND_CHIP_CLASS =
  "inline-flex h-full min-w-fit cursor-pointer items-center gap-1.5 whitespace-nowrap px-2 text-[11px] font-medium";

export const FILTER_ISLAND_CHIP_SHELL_CLASS =
  "flex w-fit min-w-0 max-w-full items-stretch rounded-md bg-black/5 text-foreground dark:bg-white/5";

export const FILTER_ISLAND_CHIP_INNER_CLASS =
  "flex h-6 min-h-6 min-w-0 items-stretch overflow-hidden rounded-md";

export const FILTER_ISLAND_CONTENT_CLASS =
  "inline-flex w-max min-w-0 max-w-full flex-col overflow-hidden rounded-md";

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
