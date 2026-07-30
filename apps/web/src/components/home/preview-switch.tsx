"use client";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import type { PreviewKey } from "../../hooks/usePreviewHint";

type Props = {
  active: PreviewKey;
  onChange: (next: PreviewKey) => void;
  showHint?: boolean;
};

export function PreviewSwitchPill({ active, onChange, showHint }: Props) {
  const tabClass = (isActive: boolean) =>
    cn(
      "border px-2.5 min-h-[34px] min-w-0 text-xs font-heading transition-all sm:min-h-[38px] sm:px-5 sm:text-sm",
      isActive
        ? "border-primary/35 bg-primary text-primary-foreground shadow-[inset_0_1px_0_hsl(var(--primary-foreground)/0.3)] ring-1 ring-primary/25 hover:bg-primary"
        : "border-border/70 bg-background/70 text-foreground/90 hover:bg-background"
    );

  return (
    <div className="pointer-events-none absolute bottom-px left-0 right-0 z-20">
      <div className="relative">
        <div className="absolute inset-x-0 -top-[2px] h-[15px] border-t border-border bg-background"></div>
      </div>

      <div className="pointer-events-auto absolute left-1/2 top-0 z-30 max-w-[calc(100%-1rem)] -translate-x-1/2 -translate-y-1/2">
        <div className="relative flex max-w-full items-center gap-1 rounded-xl border border-border/80 bg-card/95 px-1.5 py-1.5 shadow-[inset_0_1px_0_hsl(var(--background)/0.95),0_14px_24px_-20px_hsl(var(--foreground)/0.5)] ring-1 ring-border/60 ring-offset-1 ring-offset-background backdrop-blur-3xl sm:gap-1.5 sm:px-2 sm:py-2">
          {showHint && (
            <div className="pointer-events-none absolute -inset-[2px] animate-pulse rounded-xl ring-2 ring-border/70"></div>
          )}

          <div
            role="group"
            aria-label="Preview feature"
            className="relative z-10 inline-flex max-w-full items-center gap-1 sm:gap-3"
          >
            <Button
              size="sm"
              variant="nav"
              className={tabClass(active === "dashboard")}
              onClick={() => onChange("dashboard")}
              aria-pressed={active === "dashboard"}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              variant="nav"
              className={tabClass(active === "roadmap")}
              onClick={() => onChange("roadmap")}
              aria-pressed={active === "roadmap"}
            >
              Roadmap
            </Button>
            <Button
              size="sm"
              variant="nav"
              className={tabClass(active === "changelog")}
              onClick={() => onChange("changelog")}
              aria-pressed={active === "changelog"}
            >
              Changelog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
