"use client";

import { HeroCta } from "@/components/shared/cta";
import { HeroHighlights } from "@/components/shared/highlights";

export function UseCasesIndexHeroContent() {
  return (
    <div className="text-left" data-component="UseCasesIndexHeroContent">
      <h1 className="max-w-3xl font-heading text-[2rem] font-semibold leading-[1.15] tracking-tight text-white text-balance sm:text-5xl sm:leading-tight md:text-6xl">
        See how teams{" "}
        <span className="inline-flex items-center rounded-md bg-white/20 px-1.5 py-[2px] align-baseline text-white backdrop-blur-sm sm:px-2">
          actually use Featul
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg">
        Practical guides for centralizing feedback, aligning roadmaps, and
        closing the loop with customers.
      </p>

      <HeroCta />
      <HeroHighlights />
    </div>
  );
}
