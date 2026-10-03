import { DitherGradient } from "@/components/dither-kit/gradient";

const blue: [number, number, number] = [77, 150, 232];
const light: [number, number, number] = [154, 211, 255];

export function Wordmark() {
  return (
    // Clip the fixed artwork to its footer space so it never covers page content.
    <div
      aria-hidden
      data-component="Wordmark"
      className="pointer-events-none relative h-[28vw] w-full select-none [clip-path:inset(0)]"
    >
      <svg
        viewBox="0 0 1440 403.2"
        className="fixed inset-x-0 bottom-0 h-[28vw] w-full overflow-hidden"
        focusable="false"
      >
        <defs>
          <clipPath id="footer-wordmark-letters">
            <text
              x="720"
              y="505"
              textAnchor="middle"
              textLength="1440"
              lengthAdjust="spacingAndGlyphs"
              fontSize="633.6"
              letterSpacing="-31.68"
              className="font-heading font-semibold"
            >
              featul
            </text>
          </clipPath>
        </defs>
        <foreignObject
          width="1440"
          height="403.2"
          clipPath="url(#footer-wordmark-letters)"
        >
          <div className="relative h-full w-full overflow-hidden bg-primary/15">
            <DitherGradient
              from={blue}
              direction="up"
              cell={3}
              opacity={0.9}
              bloom="off"
              className="-inset-y-1/4"
            />
            <DitherGradient
              from={light}
              direction="down"
              cell={3}
              opacity={0.35}
              bloom="off"
              className="-inset-y-1/4"
            />
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
