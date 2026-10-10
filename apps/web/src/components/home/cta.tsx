import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { Promotion } from "@/components/shared/promotion";

export default function CTA() {
  return (
    <section
      className="relative mb-0 mt-12 bg-background pb-10 pt-4 sm:mt-16 sm:pb-12 sm:pt-6"
      data-component="CTA"
    >
      <MarketingContainer className="relative z-10">
        <div className={marketingRailClass}>
          <Promotion
            title="Your next great feature starts with listening."
            description="Give your customers a voice and your team a clear next step. Create your free workspace and start the conversation today."
          />
        </div>
      </MarketingContainer>
    </section>
  );
}
