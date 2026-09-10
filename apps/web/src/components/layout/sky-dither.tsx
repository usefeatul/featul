"use client";

import { DitherBands, type DitherBand } from "@/components/dither-kit/gradient";
import { cn } from "@featul/ui/lib/utils";

/** Cream → coral → orange → yellow → primary blue, full-bleed behind the dashboard. */
const SKY_DITHER_BANDS: DitherBand[] = [
  { color: [248, 247, 244], at: 0 },
  { color: [236, 98, 58], at: 0.16 },
  { color: [255, 148, 48], at: 0.38 },
  { color: [236, 198, 62], at: 0.62 },
  { color: "blue", at: 0.84 },
  { color: [32, 110, 210], at: 1 },
];

export function HeroSkyDither({ className }: { className?: string }) {
  return (
    <DitherBands
      bands={SKY_DITHER_BANDS}
      cell={5}
      className={cn(
        "[mask-image:linear-gradient(to_bottom,transparent_0%,black_14%,black_100%)]",
        className,
      )}
    />
  );
}
