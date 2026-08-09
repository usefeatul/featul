"use client";

import { SkyMarketingHero } from "@/components/layout/hero";
import { IntegrationsIndexHeroContent } from "./intro";

export function IntegrationsIndexHero() {
  return (
    <SkyMarketingHero
      dataComponent="IntegrationsIndexHero"
      imageAlt="Featul dashboard preview"
    >
      <IntegrationsIndexHeroContent />
    </SkyMarketingHero>
  );
}
