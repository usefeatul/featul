import type { ComponentProps } from "react";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";

/** Shared primary action with the app's raised button treatment. */
export function WidgetButton({
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant">) {
  return (
    <Button
      variant="default"
      size="sm"
      {...props}
      className={cn("bg-primary text-primary-foreground dark:text-primary-foreground", className)}
    />
  );
}
