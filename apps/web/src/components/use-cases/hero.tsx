"use client";

import { SkyMarketingHero } from "@/components/layout/hero";
import { UseCaseHeroContent } from "./content";

export function UseCaseHero({
  title,
  description,
  badge,
}: {
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <SkyMarketingHero
      dataComponent="UseCaseHero"
      imageAlt="Featul dashboard preview"
    >
      <UseCaseHeroContent
        title={title}
        description={description}
        badge={badge}
      />
    </SkyMarketingHero>
  );
}
