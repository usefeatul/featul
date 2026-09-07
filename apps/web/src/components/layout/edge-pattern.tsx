import { cn } from "@featul/ui/lib/utils";

const STRIP_WIDTH = "w-[clamp(2.25rem,5vw,4.5rem)]";

/** px — 2px line every 8px so a line lands on the 64px navbar bottom */
const LINE_PERIOD = 8;
const LINE_THICKNESS = 2;

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
          "absolute inset-y-0 w-0.5 bg-border",
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
              y={LINE_PERIOD - LINE_THICKNESS}
              width="1"
              height={LINE_THICKNESS}
              fill="var(--border)"
              opacity="0.7"
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
