"use client";

import { MarketingContainer } from "@/components/layout/container";
import { FaqAccordion } from "@/components/shared/accordion";
import type { Alternative } from "@/config/alternatives";
import { getAlternativeFaq } from "@/data/alt";

export default function AlternativeFAQs({ alt }: { alt: Alternative }) {
  const { description, items } = getAlternativeFaq(alt.slug);

  return (
    <MarketingContainer>
      <section className="py-16 md:py-24">
        <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
          <FaqAccordion
            title={`FAQs about ${alt.name} alternatives`}
            description={description}
            items={items}
            limit={8}
          />
        </div>
      </section>
    </MarketingContainer>
  );
}
