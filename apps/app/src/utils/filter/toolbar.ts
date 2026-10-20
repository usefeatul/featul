import { cn } from "@featul/ui/lib/utils";

/** Active filter buttons keep the raised surface; only the icon picks up the primary colour. */
export function filterToolbarButtonClass(isActive: boolean, className?: string) {
  return cn(
    className,
    isActive &&
      "text-primary hover:text-primary dark:text-primary dark:hover:text-primary",
  );
}
