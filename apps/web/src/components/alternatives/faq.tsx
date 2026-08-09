"use client";

import { Container } from "@/components/global/container";
import { FaqAccordion } from "@/components/shared/accordion";
import type { Alternative } from "@/config/alternatives";
import { getAlternativeFaq } from "@/data/alt";

export default function AlternativeFAQs({ alt }: { alt: Alternative }) {
  const { description, items } = getAlternativeFaq(alt.slug);

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16 md:py-24">
        <div className="max-w-5xl px-0 sm:px-6">
          <div className="max-w-xl">
            <FaqAccordion
              title={`FAQs about ${alt.name} alternatives`}
              description={description}
              items={items}
              limit={6}
            />
          </div>
        </div>
      </section>
    </Container>
  );
}
