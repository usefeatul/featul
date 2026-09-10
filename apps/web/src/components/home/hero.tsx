"use client";

import { SkyMarketingHero } from "@/components/layout/hero";
import { HeroContent } from "./content";
import { HeroReviews } from "./reviews";

export function Hero() {
  return (
    <SkyMarketingHero
      dataComponent="Hero"
      imageAlt="Featul feedback dashboard"
      className="pb-0"
      bannerClassName="mt-2 sm:mt-3"
      beforeBanner={<HeroReviews />}
    >
      <HeroContent />
    </SkyMarketingHero>
  );
}
