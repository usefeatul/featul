"use client";

import type { Alternative } from "@/config/alternatives";
import { Hero } from "@/components/home/hero";
import { AlternativeHeroContent } from "./content";
import { getAltDescription } from "@/types/descriptions";

export function AlternativeHero({ alt }: { alt: Alternative }) {
  return (
    <Hero dataComponent="AlternativeHero">
      <AlternativeHeroContent
        name={alt.name}
        description={getAltDescription(alt.slug, "first")}
        heroTitle={alt.heroTitle}
        heroKicker={alt.heroKicker}
      />
    </Hero>
  );
}
