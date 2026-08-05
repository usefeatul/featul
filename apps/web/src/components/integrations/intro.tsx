"use client";

import { HeroCta } from "@/components/shared/cta";
import { HeroHighlights } from "@/components/shared/highlights";

export function IntegrationsIndexHeroContent() {
  return (
    <div className="text-left" data-component="IntegrationsIndexHeroContent">
      <h1 className="max-w-3xl font-heading text-[2rem] font-semibold leading-[1.15] tracking-tight text-white text-balance sm:text-5xl sm:leading-tight md:text-6xl">
        Connect Featul with{" "}
        <span className="inline-flex items-center rounded-md bg-white/20 px-1.5 py-[2px] align-baseline text-white backdrop-blur-sm sm:px-2">
          the tools you already use
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg">
        Slack, Discord, Notra, and more. Keep feedback flowing where your team
        already works, without switching tabs.
      </p>

      <HeroCta />
      <HeroHighlights />
    </div>
  );
}
