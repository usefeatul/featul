import { useMemo } from "react";
import { cn } from "@feedgot/ui/lib/utils";
import { UpIcon } from "@feedgot/ui/icons/up";
import type { ScrollBehaviorOption } from "../../types/reading";

type ReadingProgressButtonProps = {
  percent: number;
  position: "top" | "bottom";
  className?: string;
  scrollBehavior: ScrollBehaviorOption;
};

export function ReadingProgressButton({
  percent,
  position,
  className,
  scrollBehavior,
}: ReadingProgressButtonProps) {
  const isTop = position === "top";
  const posClass = useMemo(
    () => (isTop ? "top-4" : "bottom-4 sm:bottom-6"),
    [isTop]
  );
  const ariaLabel = useMemo(() => `Reading progress ${percent}%`, [percent]);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={ariaLabel}
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50",
        posClass,
        className
      )}
      style={
        isTop ? undefined : { bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }
      }
      >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior })}
        title="Scroll to top"
        className={cn(
          "inline-flex items-center gap-4 rounded-md min-h-8",
          "bg-black/95 text-white dark:bg-zinc-900",
          "px-3.5 py-2.5 text-xs font-medium shadow/50",
          "border border-white/10 dark:border-zinc-800"
        )}
      >
        <UpIcon className="size-3.5" aria-hidden />
        <span className="tabular-nums">{percent}%</span>
      </button>
    </div>
  );
}