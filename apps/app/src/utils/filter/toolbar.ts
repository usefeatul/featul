import { cn } from "@featul/ui/lib/utils";

/** Active filter buttons look pressed into the raised surface. */
export function filterToolbarButtonClass(isActive: boolean, className?: string) {
  return cn(
    className,
    isActive &&
      "border-black/[0.1] from-muted to-muted text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] dark:border-white/[0.1] dark:from-black/30 dark:to-black/20 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]",
  );
}
