"use client";

import { Hero } from "@/components/home/hero";
import { AlternativesIndexHeroContent } from "./intro";

export function AlternativesIndexHero() {
  return (
    <Hero dataComponent="AlternativesIndexHero">
      <AlternativesIndexHeroContent />
    </Hero>
  );
}
