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
        "overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_64px_-28px_rgba(15,23,42,0.22)]",
        className,
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border/80 bg-card px-4 py-2 sm:px-5 sm:py-2.5">
        <div className="flex items-center gap-1.5 justify-self-start" aria-hidden>
          <span className="size-2.5 rounded-lg bg-accent/35" />
          <span className="size-2.5 rounded-lg bg-accent/35" />
          <span className="size-2.5 rounded-lg bg-accent/35" />
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-1.5 sm:min-w-[15rem]">
          <FeatulLogoIcon size={13} className="text-accent" />
          <span className="truncate text-[11px] text-accent/80 sm:text-xs">
            app.featul.com/integrations
          </span>
        </div>

        <div aria-hidden />
      </div>

      {children}
    </div>
  );
}
