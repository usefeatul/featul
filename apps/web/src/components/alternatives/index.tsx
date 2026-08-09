"use client";

import { SkyMarketingHero } from "@/components/layout/hero";
import { AlternativesIndexHeroContent } from "./intro";

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
