"use client";

import { HeroCta } from "@/components/shared/cta";
import { HeroHighlights } from "@/components/shared/highlights";

export function HeroContent() {
  return (
    <div className="text-left" data-component="HeroContent">
      <h1 className="font-heading text-[2rem] font-semibold leading-[1.15] tracking-tight text-white text-balance sm:text-4xl sm:leading-tight lg:text-[2.75rem] xl:text-5xl">
        From upvote to shipped.{" "}
        <span className="inline-flex items-center rounded-md border border-white/55 bg-white/20 px-1.5 py-[2px] align-baseline text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_6px_14px_rgba(0,70,140,0.2)] backdrop-blur-md supports-[backdrop-filter]:bg-white/28 sm:px-2">
          In one workspace.
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance [text-shadow:0_1px_6px_rgba(0,0,0,0.25)] sm:mt-6 sm:text-base">
        Collect votes, share a public roadmap, and publish a changelog. MIT
        licensed, self-host or hosted in the EU, billed per workspace not per
        seat.
      </p>

      <HeroCta />
      <HeroHighlights />
    </div>
  );
}
