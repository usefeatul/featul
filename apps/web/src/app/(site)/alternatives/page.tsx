import { Container } from "@/components/global/container";
import { getAllAlternatives } from "@/config/alternatives";
import { ROUNDUP_FAQS } from "@/config/alternatives-roundup";
import AlternativesList from "@/components/alternatives/list";
import { AlternativesIndexHero } from "@/components/alternatives/index";
import { AlternativesRoundup } from "@/components/alternatives/roundup";
import { FaqAccordion } from "@/components/shared/accordion";
import { createPageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/config/seo";
import { serializeJsonLd } from "@/lib/security";
import {
  buildAlternativesItemListSchema,
  buildFaqPageSchema,
} from "@/lib/schema";

export const metadata = createPageMetadata({
  title: "Best Featurebase alternatives 2026 | Featul vs Canny",
  description:
    "Compare the best Featurebase and Canny alternatives in 2026. Featul, Frill, UserJot, and Productboard side by side on pricing, open source, EU hosting, and changelogs.",
  path: "/alternatives",
  absoluteTitle: true,
});

export default function AlternativesIndexPage() {
  const allAlternatives = getAllAlternatives().sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const faqSchema = buildFaqPageSchema(
    ROUNDUP_FAQS.items.map((item) => ({
      question: item.question,
      answer: item.answer,
    })),
  );

  return (
    <main className="min-h-screen overflow-x-clip">
      <script
        id="alternatives-itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildAlternativesItemListSchema({
              siteUrl: SITE_URL,
              items: allAlternatives.map((item) => ({
                name: item.name,
                slug: item.slug,
              })),
            }),
          ),
        }}
      />
      <script
        id="alternatives-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <AlternativesIndexHero />
      <div className="relative mx-auto max-w-6xl">
        <AlternativesRoundup />
        <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14 pb-6 sm:pb-8">
          <section>
            <div className="border-b border-border/70 pb-6 sm:pb-8">
              <p className="text-accent text-[11px] font-medium uppercase tracking-[0.14em]">
                All comparisons
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-heading text-balance text-xl font-bold sm:text-2xl lg:text-3xl">
                  Every Featul vs page
                </h2>
                <span className="text-accent inline-flex items-center text-xs font-medium">
                  {allAlternatives.length} comparisons
                </span>
              </div>
              <p className="text-accent mt-3 max-w-2xl text-sm sm:text-base">
                Detailed Featurebase, Canny, Productboard, and other alternative
                pages with feature tables, migration notes, and honest tradeoffs.
              </p>
            </div>

            <div className="mt-2">
              <AlternativesList items={allAlternatives} />
            </div>
          </section>
        </Container>
        <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
          <section className="py-16 md:py-24">
            <div className="max-w-5xl px-0 sm:px-6">
              <div className="max-w-xl">
                <FaqAccordion
                  title="FAQs about Featurebase and Canny alternatives"
                  description={ROUNDUP_FAQS.description}
                  items={ROUNDUP_FAQS.items}
                />
              </div>
            </div>
          </section>
        </Container>
      </div>
    </main>
  );
}
