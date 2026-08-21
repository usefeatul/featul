import type { ComponentProps, ReactNode } from "react";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

export function OverlayCard({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(overlayDialogClass, "flex h-full flex-col", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function OverlayCardPanel({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn(overlayInnerClass, className)} {...props}>
      {children}
    </div>
  );
}
