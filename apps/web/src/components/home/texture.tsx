import {
  DitherGradient,
  type GradientDirection,
} from "@/components/dither-kit/gradient";

type TextureSpec = {
  color: [number, number, number];
  direction: GradientDirection;
  cell: number;
};

const textures = {
  blue: {
    color: [142, 198, 250],
    direction: "down",
    cell: 3,
  },
  violet: {
    color: [186, 166, 240],
    direction: "left",
    cell: 2,
  },
  peach: {
    color: [247, 190, 132],
    direction: "down",
    cell: 3,
  },
  mint: {
    color: [143, 212, 177],
    direction: "right",
    cell: 2,
  },
  rose: {
    color: [238, 161, 192],
    direction: "down",
    cell: 3,
  },
  teal: {
    color: [90, 192, 202],
    direction: "down",
    cell: 3,
  },
} satisfies Record<string, TextureSpec>;

export type BentoTone = keyof typeof textures;

export function BentoTexture({ tone }: { tone: BentoTone }) {
  const { color, direction, cell } = textures[tone];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]"
    >
      <DitherGradient
        from={color}
        direction={direction}
        cell={cell}
        opacity={0.4}
        bloom="off"
        className="-inset-1/4"
      />
    </div>
  );
}
