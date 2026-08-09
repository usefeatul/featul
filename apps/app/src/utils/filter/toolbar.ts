import { cn } from "@featul/ui/lib/utils";

export function filterToolbarButtonClass(isActive: boolean, className?: string) {
  return cn(
    className,
    isActive &&
      "bg-muted text-foreground shadow-none ring-1 ring-border/70 dark:bg-muted/40",
  );
}
