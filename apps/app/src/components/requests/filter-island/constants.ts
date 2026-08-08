import type { Transition } from "framer-motion";

export const FILTER_ISLAND_EASE = [0.32, 0.72, 0, 1] as const;

export const FILTER_ISLAND_MAX_WIDTH_CLASS =
  "max-w-[min(24rem,calc(100vw-2rem))]";

export const FILTER_ISLAND_SHELL_CLASS =
  "pointer-events-auto cursor-pointer overflow-hidden rounded-t-none rounded-b-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border border-t-0 border-white/10 dark:border-black/10 shadow-[0_10px_32px_-14px_rgba(0,0,0,0.65)] dark:shadow-[0_10px_32px_-14px_rgba(0,0,0,0.2)]";

export const FILTER_ISLAND_MUTED_ICON_CLASS =
  "text-white/70 dark:text-neutral-950/70";

export const FILTER_ISLAND_CLEAR_ALL_CLASS =
  "shrink-0 cursor-pointer rounded-sm px-1.5 py-0.5 text-[11px] font-medium text-white/55 transition-colors hover:bg-white/10 hover:text-white dark:text-neutral-950/55 dark:hover:bg-black/8 dark:hover:text-neutral-950";

export const FILTER_ISLAND_CHIP_CLASS =
  "inline-flex h-6 max-w-[8.5rem] cursor-pointer items-center gap-1 rounded-sm border border-white/10 bg-white/10 px-2 text-[11px] text-white transition-colors hover:bg-white/18 dark:border-black/10 dark:bg-black/8 dark:text-neutral-950 dark:hover:bg-black/12";

export type FilterIslandTransitions = {
  island: Transition;
  visibility: Transition;
  content: Transition;
};

export function getFilterIslandTransitions(
  reduceMotion: boolean | null,
): FilterIslandTransitions {
  if (reduceMotion) {
    return {
      island: { duration: 0 },
      visibility: { duration: 0 },
      content: { duration: 0 },
    };
  }

  return {
    island: { duration: 0.28, ease: FILTER_ISLAND_EASE },
    visibility: { duration: 0.32, ease: FILTER_ISLAND_EASE },
    content: { duration: 0.24, ease: FILTER_ISLAND_EASE },
  };
}
