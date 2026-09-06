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

      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-accent text-balance sm:mt-6 sm:text-base">
        Collect votes, share a public roadmap, and publish a changelog. MIT
        licensed, self-host or hosted in the EU, billed per workspace not per
        seat.
      </p>

      <HeroCta />
      <HeroHighlights />
    </div>
  );
}
