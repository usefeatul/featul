"use client";

import { SkyMarketingHero } from "@/components/layout/hero";
import { UseCasesIndexHeroContent } from "./intro";

export function UseCasesIndexHero() {
  return (
    <SkyMarketingHero
      dataComponent="UseCasesIndexHero"
      imageAlt="Featul dashboard preview"
    >
      <UseCasesIndexHeroContent />
    </SkyMarketingHero>
  );
}
