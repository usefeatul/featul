import { cn } from "@featul/ui/lib/utils";

export const sidebarBadgeClass =
  "inline-flex h-[19px] min-w-5 shrink-0 items-center justify-center rounded-sm border border-border bg-card text-xs font-extralight text-accent tabular-nums ring-1 ring-border/20 ring-offset-1 ring-offset-white dark:bg-black/50 dark:text-accent dark:ring-offset-black";

export function sidebarBadgeClassName(fixedWidth = true) {
  return cn(sidebarBadgeClass, fixedWidth && "w-5");
}
