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
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-border/60 bg-background px-3 py-1.5 sm:max-w-md sm:justify-start">
          <FeatulLogoIcon size={14} />
          <span className="truncate text-[11px] text-accent sm:text-xs">
            app.featul.com/integrations
          </span>
        </div>

        <div className="hidden w-10 shrink-0 sm:block" aria-hidden />
      </div>

      {children}
    </div>
  );
}
