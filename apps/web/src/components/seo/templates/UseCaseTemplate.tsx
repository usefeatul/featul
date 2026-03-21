/**
 * UseCaseTemplate - Smart template for Use Case pages
 *
 * Renders a structured use case page with:
 * - Problem/Solution text
 * - Pain points analysis
 * - Solution benefits
 * - Related pages section
 */

import Link from "next/link";
import Script from "next/script";
import { Container } from "@/components/global/container";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { VerticalLines } from "@/components/vertical-lines";
import type { UseCasePageData } from "@/lib/data/programmatic/generators";
import type { RelatedLink } from "@/lib/seo/interlink";
import { SITE_URL } from "@/config/seo";
import { serializeJsonLd } from "@/lib/security";
import {
  buildFaqPageSchema,
  buildUseCasesBreadcrumbSchema,
} from "@/lib/structured-data";

interface Props {
  data: UseCasePageData;
  relatedLinks: RelatedLink[];
}

export function UseCaseTemplate({ data, relatedLinks }: Props) {
  const { meta, useCase, sections, faqs } = data;

  const faqSchema = buildFaqPageSchema(faqs);
  const breadcrumbSchema = buildUseCasesBreadcrumbSchema({
    siteUrl: SITE_URL,
    slug: useCase.slug,
    name: useCase.title,
  });

  return (
    <main className="min-h-screen pt-16 bg-background">
      {/* JSON-LD Schemas */}
      <Script
        id="usecase-faq-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <Script
        id="usecase-breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />

      <Container
        maxWidth="6xl"
        className="px-4 sm:px-10 lg:px-12 xl:px-14 relative"
      >
        <VerticalLines className="absolute z-0" />

        {/* Hero Section */}
        <section className="pt-10 md:pt-16 pb-12 relative z-10">
          <div className="max-w-3xl">
            <p className="text-sm text-muted-foreground mb-2">
              <Link href="/use-cases" className="hover:underline">
                Use Cases
              </Link>
              {" / "}
              {useCase.industry}
            </p>
            <h1 className="font-heading text-balance text-3xl sm:text-4xl lg:text-5xl font-bold">
              {meta.h1}
            </h1>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg max-w-2xl">
              {sections.intro}
            </p>
            <div className="mt-8">
              <Link
                href="/start"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Free Trial →
              </Link>
            </div>
          </div>
        </section>

        {/* Pain Points vs Solutions */}
        <section className="py-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pain Points */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4 text-red-500/80">
                The Challenge
              </h2>
              {sections.painPoints.map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-lg border border-red-200/20 bg-red-500/5"
                >
                  <h3 className="font-medium text-foreground mb-2">
                    {item.problem}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.impact}</p>
                </div>
              ))}
            </div>

            {/* Solutions */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4 text-green-500/80">
                The Solution
              </h2>
              {sections.solutions.map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-lg border border-green-200/20 bg-green-500/5"
                >
                  <h3 className="font-medium text-foreground mb-2">
                    {item.solution}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 relative z-10">
          <h2 className="text-2xl font-semibold mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-border bg-card"
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Links (The Spiderweb) */}
        <div className="relative z-10">
          <RelatedLinks links={relatedLinks} />
        </div>
      </Container>
    </main>
  );
}

export default UseCaseTemplate;
