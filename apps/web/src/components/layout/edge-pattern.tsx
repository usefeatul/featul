import { cn } from "@featul/ui/lib/utils";

export const EDGE_STRIP_WIDTH = "var(--marketing-edge-strip)";

export const edgeStripWidthClass = "w-[var(--marketing-edge-strip)]";

/** Keep navbar chrome between the two vertical closing lines. */
export const edgeChromeInsetClass =
  "left-[calc(var(--marketing-edge-strip)+1px)] right-[var(--marketing-edge-strip)]";

/** Horizontal padding that never sits under the edge pattern. */
export const edgeGutterXClass =
  "px-[max(1rem,calc(var(--marketing-edge-strip)+0.5rem))] sm:px-10 lg:px-12 xl:px-14";

/** px — 0.5px line every 8px so a line lands on the 64px navbar bottom */
const LINE_PERIOD = 8;
const LINE_THICKNESS = 0.5;

type EdgeStripProps = {
  side: "left" | "right";
};

function EdgeStrip({ side }: EdgeStripProps) {
  return (
    <div
      className={cn(
        edgeStripWidthClass,
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
          "absolute inset-y-0 w-[0.5px] bg-border",
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
          "pointer-events-none fixed inset-y-0 left-0 z-[20]",
          className,
        )}
        data-component="MarketingEdgePatternLeft"
      >
        <EdgeStrip side="left" />
      </div>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-y-0 right-0 z-[20]",
          className,
        )}
        data-component="MarketingEdgePatternRight"
      >
        <EdgeStrip side="right" />
      </div>
    </>
  );
}
