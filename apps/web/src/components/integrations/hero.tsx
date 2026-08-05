"use client";

import { SkyMarketingHero } from "@/components/layout/hero";
import { IntegrationHeroContent } from "./content";
import { getIntegrationIcon } from "./icons";

export function IntegrationHero({
  name,
  description,
  slug,
  website,
}: {
  name: string;
  description?: string;
  slug: string;
  website?: string;
}) {
  const Icon = getIntegrationIcon(slug);

  return (
    <SkyMarketingHero
      dataComponent="IntegrationHero"
      imageAlt={`${name} integration with Featul dashboard preview`}
    >
      <IntegrationHeroContent
        name={name}
        description={description}
        website={website}
        Icon={Icon}
      />
    </SkyMarketingHero>
  );
}
