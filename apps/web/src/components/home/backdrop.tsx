import {
  DitherGradient,
  type GradientDirection,
} from "@/components/dither-kit/gradient";
import { cn } from "@featul/ui/lib/utils";

const light: [number, number, number] = [214, 237, 255];

// Keep the shared hero and wordmark artwork predominantly brand blue.
const colourFields = [
  "radial-gradient(ellipse at 0% 0%, rgba(188,169,239,0.45) 0%, transparent 38%)",
  "radial-gradient(ellipse at 100% 0%, rgba(249,195,146,0.38) 0%, transparent 34%)",
  "radial-gradient(ellipse at 0% 100%, rgba(166,223,192,0.4) 0%, transparent 38%)",
  "radial-gradient(ellipse at 100% 100%, rgba(240,172,201,0.35) 0%, transparent 34%)",
].join(", ");

function waveMask(paths: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="none">${paths}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

type Wave = {
  name: string;
  color: [number, number, number];
  direction: GradientDirection;
  opacity: number;
  mask: string;
};

const waves: Wave[] = [
  {
    name: "sweeping-light",
    color: [188, 229, 255],
    direction: "right",
    opacity: 0.78,
    mask: waveMask(
      '<path fill="white" d="M-160 100C170-120 360 370 700 230S1170-100 1600 230L1600 420C1170 90 1070 650 660 400S120 130-160 330Z"/>',
    ),
  },
  {
    name: "lower-current",
    color: [132, 213, 244],
    direction: "left",
    opacity: 0.65,
    mask: waveMask(
      '<path fill="white" d="M-160 780C120 280 420 980 780 590S1240 230 1600 620L1600 960H-160Z"/>',
    ),
  },
  {
    name: "blue-contours",
    color: [30, 95, 186],
    direction: "down",
    opacity: 0.32,
    mask: waveMask(
      '<g fill="none" stroke="white"><path stroke-width="90" d="M-180 425C150 60 430 720 825 420S1240 190 1610 500"/><path stroke-width="2" opacity="0.65" d="M-180 340C150-25 430 635 825 335S1240 105 1610 415M-180 510C150 145 430 805 825 505S1240 275 1610 585M-160 870C120 370 420 1070 780 680S1240 320 1600 710"/></g>',
    ),
  },
];

export function DitherBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-primary",
        className,
      )}
      style={{ backgroundImage: colourFields }}
    >
      <DitherGradient
        from={light}
        direction="down"
        cell={3}
        opacity={0.18}
        bloom="off"
        className="-inset-1/4"
      />
      {waves.map((wave) => (
        <div
          key={wave.name}
          className="absolute inset-0"
          style={{
            maskImage: wave.mask,
            maskSize: "100% 100%",
            maskRepeat: "no-repeat",
          }}
        >
          <DitherGradient
            from={wave.color}
            direction={wave.direction}
            cell={3}
            opacity={wave.opacity}
            bloom="off"
            className="-inset-1/4"
          />
        </div>
      ))}
    </div>
  );
}
