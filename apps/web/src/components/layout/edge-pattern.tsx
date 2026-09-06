import { cn } from "@featul/ui/lib/utils";

const STRIP_WIDTH = "w-[clamp(3.5rem,8vw,7rem)]";

const edgeStripClassName = cn(
  STRIP_WIDTH,
  "h-full",
  "bg-[color-mix(in_oklab,var(--muted)_35%,var(--background))]",
  "[background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_10px,color-mix(in_oklab,var(--border)_55%,transparent)_10px,color-mix(in_oklab,var(--border)_55%,transparent)_11px)]",
);

type MarketingEdgePatternProps = {
  className?: string;
};

export function MarketingEdgePattern({ className }: MarketingEdgePatternProps) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-y-0 left-0 z-[1] hidden lg:block",
          className,
        )}
        data-component="MarketingEdgePatternLeft"
      >
        <div className={cn(edgeStripClassName, "border-r border-border")} />
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-y-0 right-0 z-[1] hidden lg:block",
          className,
        )}
        data-component="MarketingEdgePatternRight"
      >
        <div className={cn(edgeStripClassName, "border-l border-border")} />
      </div>
    </>
  );
}
