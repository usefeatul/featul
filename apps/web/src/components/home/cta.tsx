import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { Promotion } from "@/components/shared/promotion";
import { homeCta } from "@/data/home";

export default function CTA() {
  return (
    <section
      className="relative mb-0 mt-12 bg-background pb-10 pt-4 sm:mt-16 sm:pb-12 sm:pt-6"
      data-component="CTA"
    >
      <MarketingContainer className="relative z-10">
        <div className={marketingRailClass}>
          <Promotion
            title={homeCta.title}
            description={homeCta.description}
          />
        </div>
      </MarketingContainer>
    </section>
  );
}
