"use client";

import { HeroCta } from "@/components/shared/cta";
import { HeroHighlights } from "@/components/shared/highlights";

export function HeroContent() {
  return (
    <div className="max-w-2xl text-left" data-component="HeroContent">
      <h1 className="font-heading text-[2rem] font-semibold leading-[1.15] tracking-tight text-foreground text-balance sm:text-4xl sm:leading-tight lg:text-[2.75rem] xl:text-5xl">
        From upvote to shipped.{" "}
        <span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-1.5 py-[2px] align-baseline text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.06)] sm:px-2">
          In one workspace.
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-accent sm:mt-6 sm:text-lg">
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
