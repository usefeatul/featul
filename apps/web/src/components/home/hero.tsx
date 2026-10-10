import type { ReactNode } from "react";
import {
  MarketingContainer,
  MarketingRail,
} from "@/components/layout/container";
import { HeroContent } from "./content";
import { Showcase } from "./showcase";

/** Shared hero layout keeps marketing introductions and previews consistent. */
export function Hero({
  children,
  dataComponent = "Hero",
}: {
  children?: ReactNode;
  dataComponent?: string;
}) {
  return (
    <section
      className="relative pb-8 pt-24 sm:pb-12 sm:pt-24"
      data-component={dataComponent}
    >
      <MarketingContainer>
        <MarketingRail>
          <div className="px-2 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-12">
            {children ?? <HeroContent />}
          </div>
        </MarketingRail>
      </MarketingContainer>
      <Showcase />
    </section>
  );
}
