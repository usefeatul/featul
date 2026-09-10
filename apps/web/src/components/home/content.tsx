"use client";

import { HeroCta } from "@/components/shared/cta";
import { HeroHighlights } from "@/components/shared/highlights";
import {
  HeadingHighlight,
  marketingDisplayHeadingClass,
  marketingLeadClass,
} from "@/components/shared/heading-highlight";
import { cn } from "@featul/ui/lib/utils";

const EU_FLAG_STARS = [
  { cx: 9, cy: 2.9 },
  { cx: 10.55, cy: 3.315 },
  { cx: 11.685, cy: 4.45 },
  { cx: 12.1, cy: 6 },
  { cx: 11.685, cy: 7.55 },
  { cx: 10.55, cy: 8.685 },
  { cx: 9, cy: 9.1 },
  { cx: 7.45, cy: 8.685 },
  { cx: 6.315, cy: 7.55 },
  { cx: 5.9, cy: 6 },
  { cx: 6.315, cy: 4.45 },
  { cx: 7.45, cy: 3.315 },
] as const;

export function HeroContent() {
  return (
    <div className="max-w-2xl text-left" data-component="HeroContent">
      <h1 className={cn(marketingDisplayHeadingClass, "xl:text-5xl")}>
        From upvote to shipped.{" "}
        <HeadingHighlight>In one workspace.</HeadingHighlight>
      </h1>

      <p className={marketingLeadClass}>
        MIT licensed. Billed per workspace, not per seat.
        <br />
        Start in minutes. Built and hosted in the{" "}
        <span className="inline-flex items-center gap-1.5 align-baseline">
          <svg
            aria-hidden
            viewBox="0 0 18 12"
            className="h-3.5 w-[1.3rem] shrink-0 overflow-hidden rounded-[1px] ring-1 ring-border/60"
          >
            <rect width="18" height="12" fill="#003399" />
            <g fill="#FFCC00">
              {EU_FLAG_STARS.map((star, i) => (
                <circle key={i} cx={star.cx} cy={star.cy} r="0.45" />
              ))}
            </g>
          </svg>
          EU
        </span>
        .
      </p>

      <HeroCta />
      <HeroHighlights />
    </div>
  );
}
