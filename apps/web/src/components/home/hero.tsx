import {
  MarketingContainer,
  MarketingRail,
} from "@/components/layout/container";
import { HeroContent } from "./content";
import { Showcase } from "./showcase";

export function Hero() {
  return (
    <section
      className="relative pb-8 pt-24 sm:pb-12 sm:pt-24"
      data-component="Hero"
    >
      <MarketingContainer>
        <MarketingRail>
          <div className="px-2 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12">
            <HeroContent />
          </div>
        </MarketingRail>
      </MarketingContainer>
      <Showcase />
    </section>
  );
}
