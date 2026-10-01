import { cn } from "@featul/ui/lib/utils";

export function TagDot({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-1.5 shrink-0 rounded-full bg-muted-foreground", className)}
    />
  );
}
