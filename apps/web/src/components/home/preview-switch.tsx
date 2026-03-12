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
      "rounded-xl border px-4 min-h-[38px] min-w-[32px] text-sm font-semibold transition-colors sm:px-5",
      isActive
        ? "border-primary/30 bg-primary text-primary-foreground shadow-sm hover:bg-primary/95"
        : "border-transparent bg-transparent text-foreground hover:bg-white"
    );

  return (
    <div className="pointer-events-none absolute left-1/2 bottom-[1px] -translate-x-1/2 w-screen z-20">
      <div className="relative">
        <div className="absolute inset-x-0 -top-[2px] h-[15px] border-t border-border bg-background"></div>
      </div>

      <div className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-30">
        <div className="relative flex items-center gap-1.5 rounded-2xl border border-border/80 bg-muted/70 px-2 py-2 shadow-sm backdrop-blur-3xl">
          {showHint && (
            <div className="pointer-events-none absolute -inset-[2px] rounded-2xl ring-2 ring-border/60 animate-pulse"></div>
          )}

          <div
            role="group"
            aria-label="Preview feature"
            className="relative z-10 inline-flex items-center gap-3"
          >
            <Button
              size="sm"
              variant="ghost"
              className={tabClass(active === "dashboard")}
              onClick={() => onChange("dashboard")}
              aria-pressed={active === "dashboard"}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={tabClass(active === "roadmap")}
              onClick={() => onChange("roadmap")}
              aria-pressed={active === "roadmap"}
            >
              Roadmap
            </Button>
            <Button
              size="sm"
              variant="ghost"
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
