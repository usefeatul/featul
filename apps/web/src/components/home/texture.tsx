import type { CSSProperties } from "react";
import {
  DitherGradient,
  type GradientDirection,
} from "@/components/dither-kit/gradient";

type TextureSpec = {
  color: [number, number, number];
  direction: GradientDirection;
  cell: number;
  mask: CSSProperties;
};

const textures = {
  blue: {
    color: [142, 198, 250],
    direction: "down",
    cell: 3,
    mask: { maskImage: "linear-gradient(135deg, black 10%, transparent 85%)" },
  },
  violet: {
    color: [186, 166, 240],
    direction: "left",
    cell: 2,
    mask: {
      maskImage:
        "repeating-radial-gradient(ellipse at 100% 0%, black 0px 18px, rgba(0,0,0,0.12) 32px 52px, black 66px)",
    },
  },
  peach: {
    color: [247, 190, 132],
    direction: "down",
    cell: 3,
    mask: {
      maskImage:
        "repeating-linear-gradient(135deg, black 0px 28px, rgba(0,0,0,0.1) 44px 64px, black 80px)",
    },
  },
  mint: {
    color: [143, 212, 177],
    direction: "right",
    cell: 2,
    mask: {
      maskImage:
        "radial-gradient(ellipse 90% 45% at 0% 15%, black 25%, transparent 75%), radial-gradient(ellipse 90% 45% at 100% 55%, black 25%, transparent 75%)",
    },
  },
  rose: {
    color: [238, 161, 192],
    direction: "down",
    cell: 3,
    mask: {
      maskImage:
        "repeating-conic-gradient(black 0% 25%, rgba(0,0,0,0.15) 0% 50%)",
      maskSize: "64px 64px",
    },
  },
  teal: {
    color: [132, 211, 218],
    direction: "up",
    cell: 2,
    mask: {
      maskImage:
        "radial-gradient(ellipse at 50% 0%, transparent 12%, black 42%, transparent 78%)",
    },
  },
} satisfies Record<string, TextureSpec>;

export type BentoTone = keyof typeof textures;

export function BentoTexture({ tone }: { tone: BentoTone }) {
  const { color, direction, cell, mask } = textures[tone];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
    >
      <div className="absolute inset-0" style={mask}>
        <DitherGradient
          from={color}
          direction={direction}
          cell={cell}
          opacity={0.4}
          bloom="off"
          className="-inset-1/4"
        />
      </div>
    </div>
  );
}
