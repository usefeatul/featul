"use client";

import { SkyMarketingHero } from "@/components/layout/sky-marketing-hero";
import { AlternativesIndexHeroContent } from "./index-hero-content";

export function AlternativesIndexHero() {
  return (
    <SkyMarketingHero
      dataComponent="AlternativesIndexHero"
      imageAlt="Featul dashboard preview"
    >
      <AlternativesIndexHeroContent />
    </SkyMarketingHero>
  );
}
