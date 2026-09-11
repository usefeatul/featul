import type { ReactNode } from "react";

import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { cn } from "@featul/ui/lib/utils";

export function IntegrationsHeroTab({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_64px_-28px_rgba(15,23,42,0.22)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/80 bg-background/80 px-4 py-2 sm:px-5 sm:py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-accent/35" />
          <span className="size-2 rounded-full bg-accent/35" />
          <span className="size-2 rounded-full bg-accent/35" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-border/70 bg-muted/20 px-3 py-1.5 sm:max-w-sm">
          <FeatulLogoIcon size={13} className="text-accent" />
          <span className="truncate text-[11px] text-accent/80 sm:text-xs">
            app.featul.com/integrations
          </span>
        </div>

        <div className="hidden w-7 shrink-0 sm:block" aria-hidden />
      </div>

      {children}
    </div>
  );
}
