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
import { RelatedLinks } from "@/components/seo/links";
import { SkyPageShell } from "@/components/layout/shell";
import type { UseCasePageData } from "@/lib/data/programmatic/generators";
import type { RelatedLink } from "@/lib/seo/interlink";
import { SITE_URL } from "@/config/seo";
import { serializeJsonLd } from "@/lib/security";
import {
  buildFaqPageSchema,
  buildUseCasesBreadcrumbSchema,
} from "@/lib/schema";

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
    <>
      <script
        id="usecase-faq-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <script
        id="usecase-breadcrumb-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />

      <SkyPageShell
        eyebrow={
          <>
            <Link href="/use-cases" className="hover:underline">
              Use Cases
            </Link>
            {" / "}
            {useCase.industry}
          </>
        }
        title={meta.h1}
        description={
          <>
            <p>{sections.intro}</p>
            <div className="mt-6">
              <Link
                href="https://app.featul.com/auth/sign-up"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start Free Trial →
              </Link>
            </div>
          </>
        }
      >
        <section className="py-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="mb-4 text-2xl font-semibold text-red-500/80">
                The Challenge
              </h2>
              {sections.painPoints.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-red-200/20 bg-red-500/5 p-6"
                >
                  <h3 className="mb-2 font-medium text-foreground">
                    {item.problem}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.impact}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h2 className="mb-4 text-2xl font-semibold text-green-500/80">
                The Solution
              </h2>
              {sections.solutions.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-green-200/20 bg-green-500/5 p-6"
                >
                  <h3 className="mb-2 font-medium text-foreground">
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

        <section className="py-8">
          <h2 className="mb-6 text-2xl font-semibold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-6"
              >
                <h3 className="mb-2 font-semibold">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedLinks links={relatedLinks} />
      </SkyPageShell>
    </>
  );
}

export default UseCaseTemplate;
