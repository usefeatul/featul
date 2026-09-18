import { forwardRef, type ReactNode } from "react";
import { OverlayChip } from "@featul/ui/components/overlay-chip";
import { cn } from "@featul/ui/lib/utils";

export const SidebarBadge = forwardRef<
  HTMLSpanElement,
  {
    children?: ReactNode;
    className?: string;
    innerClassName?: string;
    fixedWidth?: boolean;
  }
>(function SidebarBadge(
  { children, className, innerClassName, fixedWidth = true },
  ref,
) {
  return (
    <OverlayChip
      ref={ref}
      className={cn("shrink-0 border-0 bg-transparent p-0 dark:bg-transparent", fixedWidth && "min-w-5", className)}
      innerClassName={cn("bg-transparent font-medium text-muted-foreground", innerClassName)}
    >
      {children}
    </OverlayChip>
  );
});
