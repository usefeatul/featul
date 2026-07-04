import type { ReactNode } from "react";
import { cn } from "@featul/ui/lib/utils";

type BrowserFrameProps = {
  children: ReactNode;
  url?: string;
  className?: string;
};

export function BrowserFrame({
  children,
  url = "app.featul.com",
  className,
}: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border/70 bg-card",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-red-400/90" />
          <span className="size-2.5 rounded-full bg-amber-400/90" />
          <span className="size-2.5 rounded-full bg-emerald-400/90" />
        </div>
        <div className="mx-auto flex h-7 min-w-0 flex-1 max-w-sm items-center justify-center rounded-md border border-border/50 bg-background/90 px-3 text-[11px] text-accent sm:max-w-md sm:text-xs">
          <span className="truncate">{url}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
