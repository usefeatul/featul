"use client";

import type { Alternative } from "@/config/alternatives";
import { SkyMarketingHero } from "@/components/layout/hero";
import { AlternativeHeroContent } from "./content";
import { getAltDescription } from "@/types/descriptions";

export function AlternativeHero({ alt }: { alt: Alternative }) {
  return (
    <SkyMarketingHero
      dataComponent="AlternativeHero"
      imageAlt={`${alt.name} vs Featul dashboard preview`}
    >
      <AlternativeHeroContent
        name={alt.name}
        description={getAltDescription(alt.slug, "slug-hash")}
        slug={alt.slug}
      />
    </SkyMarketingHero>
  );
}
