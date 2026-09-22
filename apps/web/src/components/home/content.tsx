"use client";

import { HeroCta } from "@/components/shared/cta";
import { HeroHighlights } from "@/components/shared/highlights";
import {
  HeadingHighlight,
  marketingDisplayHeadingClass,
  marketingLeadClass,
} from "@/components/shared/heading-highlight";
import { cn } from "@featul/ui/lib/utils";

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
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const cx = 9 + Math.cos(angle - Math.PI / 2) * 3.1;
                const cy = 6 + Math.sin(angle - Math.PI / 2) * 3.1;
                return <circle key={i} cx={cx} cy={cy} r="0.45" />;
              })}
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
