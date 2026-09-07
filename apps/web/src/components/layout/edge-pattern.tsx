import { cn } from "@featul/ui/lib/utils";

const STRIP_WIDTH = "w-[clamp(2.25rem,5vw,4.5rem)]";

/** px — 1px line repeated every 12px */
const LINE_PERIOD = 12;

type EdgeStripProps = {
  side: "left" | "right";
};

function EdgeStrip({ side }: EdgeStripProps) {
  return (
    <div
      className={cn(
        STRIP_WIDTH,
        "relative h-full bg-[color-mix(in_oklab,var(--muted)_35%,var(--background))]",
      )}
    >
      <svg
        aria-hidden
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
      >
        <rect width="100%" height="100%" fill="url(#featul-marketing-edge-lines)" />
      </svg>
      <div
        aria-hidden
        className={cn(
          "absolute inset-y-0 w-px bg-border",
          side === "left" ? "right-0" : "left-0",
        )}
      />
    </div>
  );
}

type MarketingEdgePatternProps = {
  className?: string;
};

export function MarketingEdgePattern({ className }: MarketingEdgePatternProps) {
  return (
    <>
      <svg aria-hidden className="absolute h-0 w-0" focusable="false">
        <defs>
          <pattern
            id="featul-marketing-edge-lines"
            width="1"
            height={LINE_PERIOD}
            patternUnits="userSpaceOnUse"
          >
            <rect
              x="0"
              y={LINE_PERIOD - 1}
              width="1"
              height="1"
              fill="var(--border)"
              opacity="0.55"
            />
          </pattern>
        </defs>
      </svg>

      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-y-0 left-0 z-[1] hidden lg:block",
          className,
        )}
        data-component="MarketingEdgePatternLeft"
      >
        <EdgeStrip side="left" />
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-y-0 right-0 z-[1] hidden lg:block",
          className,
        )}
        data-component="MarketingEdgePatternRight"
      >
        <EdgeStrip side="right" />
      </div>
    </>
  );
}
