"use client";

import { HeroCta } from "@/components/shared/hero-cta";
import { HeroHighlights } from "@/components/shared/hero-highlights";

export function AlternativesIndexHeroContent() {
  return (
    <div className="text-left" data-component="AlternativesIndexHeroContent">
      <h1 className="max-w-3xl font-heading text-[2rem] font-semibold leading-[1.15] tracking-tight text-white text-balance sm:text-5xl sm:leading-tight md:text-6xl">
        Featul alternatives,{" "}
        <span className="inline-flex items-center rounded-md bg-white/20 px-1.5 py-[2px] align-baseline text-white backdrop-blur-sm sm:px-2">
          compared side by side
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance [text-shadow:0_1px_6px_rgba(0,0,0,0.25)] sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg">
        Side-by-side comparisons covering features, privacy, and hosting
        differences — so you can choose the right feedback platform with
        confidence.
      </p>

      <HeroCta />
      <HeroHighlights />
    </div>
  );
}
