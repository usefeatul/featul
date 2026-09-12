/**
 * IntegrationsTemplate - Smart template for Integration pages
 *
 * Matches marketing sky-hero pattern used on home / alternatives pages.
 */

import { MarketingContainer, marketingStackClass } from "@/components/layout/container";
import Link from "next/link";
import { serializeJsonLd } from "@/lib/security";
import {
  buildFaqPageSchema,
  buildIntegrationsBreadcrumbSchema,
} from "@/lib/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@featul/ui/components/accordion";
import type { IntegrationPageData } from "@/lib/data/programmatic/generators";
import type { RelatedLink } from "@/lib/seo/interlink";
import { SITE_URL } from "@/config/seo";
import { IntegrationHero } from "@/components/integrations/hero";
import { HotkeyLink } from "@/components/global/hotkey";
import { LiveDemo } from "@/components/global/demo";
import {
  heroPrimaryCtaClass,
  skyCardKbdClassName,
  skyCardPrimaryCtaClass,
} from "@/components/shared/cta";
import { SkyCtaFrame } from "@/components/layout/sky-banner";
import { cn } from "@featul/ui/lib/utils";
import { RelatedLinks } from "@/components/seo/links";
import { SectionStack } from "@/components/layout/stack";
import { SquareIcon } from "@featul/ui/icons/square";
import { SetupIcon } from "@featul/ui/icons/setup";

interface Props {
  data: IntegrationPageData;
  relatedLinks: RelatedLink[];
}

export function IntegrationsTemplate({ data, relatedLinks }: Props) {
  const { meta, integration, sections, faqs } = data;

  const faqSchema = buildFaqPageSchema(faqs);
  const breadcrumbSchema = buildIntegrationsBreadcrumbSchema({
    siteUrl: SITE_URL,
    slug: integration.slug,
    name: integration.name,
  });

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `Featul + ${integration.name} Integration`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web application",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <main className="min-h-screen overflow-x-clip">
      <script
        id="integration-faq-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <script
        id="integration-breadcrumb-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <script
        id="integration-software-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(softwareSchema) }}
      />

      <IntegrationHero
        name={integration.name}
        description={sections.intro}
        slug={integration.slug}
        website={integration.website}
      />

      <div className={marketingStackClass}>
        <SectionStack>
          <MarketingContainer>
            <section className="pt-10 pb-6 sm:pt-12 sm:pb-8" data-component="IntegrationBenefits">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <SquareIcon aria-hidden className="size-5 text-primary" />
                <h2 className="mt-4 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                  Why connect {integration.name}
                </h2>
                <p className="mt-2 text-accent">
                  What your team gets when Featul and {integration.name} work
                  together.
                </p>
                <div className="mt-5 max-w-2xl space-y-2">
                  {sections.benefits.map((benefit, i) => {
                    const showTitle = benefit.title !== `Benefit ${i + 1}`;

                    return (
                      <div key={i} className="space-y-1">
                        {showTitle ? (
                          <h3 className="text-base font-medium text-foreground sm:text-lg">
                            {benefit.title}
                          </h3>
                        ) : null}
                        <p className="text-sm leading-6 text-accent sm:text-base">
                          {benefit.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </MarketingContainer>

          <MarketingContainer>
            <section className="py-6 sm:py-8" data-component="IntegrationHowTo">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <SetupIcon aria-hidden className="size-5 text-primary" opacity={1} />
                <h2 className="mt-4 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                  How to connect
                </h2>
                <p className="mt-2 text-accent">
                  A short setup path from Featul into {integration.name}.
                </p>
                <ol className="mt-5 max-w-2xl list-decimal space-y-2 pl-5 text-sm leading-6 text-accent sm:text-base">
                  {sections.howItWorks.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </section>
          </MarketingContainer>

          {sections.extra?.length ? (
            <MarketingContainer>
              <section className="py-6 sm:py-8" data-component="IntegrationGuide">
                <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                  <h2 className="text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                    {integration.name} integrations in more detail
                  </h2>
                  <div className="mt-6 space-y-6">
                    {sections.extra.map((section) => (
                      <article key={section.title} className="space-y-3">
                        <h3 className="text-base font-medium text-foreground sm:text-lg">
                          {section.title}
                        </h3>
                        <p className="text-sm leading-7 text-accent sm:text-base">
                          {section.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            </MarketingContainer>
          ) : null}

          <MarketingContainer>
            <section className="py-8 sm:py-10" data-component="IntegrationVerdict">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <SkyCtaFrame>
                  <p className="text-sm text-foreground/70">
                    {meta.h1}
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance font-heading text-xl font-medium text-foreground sm:text-2xl lg:text-3xl">
                    Connect {integration.name} and keep feedback moving.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-foreground/80 sm:text-base">
                    Set up in minutes. Triage where your team already works.
                  </p>
                  <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <HotkeyLink
                      variant="nav"
                      label={`Connect ${integration.name}`}
                      className={cn(
                        "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto",
                        skyCardPrimaryCtaClass,
                      )}
                      kbdClassName={skyCardKbdClassName}
                    />
                    <LiveDemo
                      variant="default"
                      className={cn(
                        "h-10 min-h-[40px] w-full min-w-[40px] shadow-sm sm:w-auto",
                        heroPrimaryCtaClass,
                      )}
                    />
                  </div>
                </SkyCtaFrame>
              </div>
            </section>
          </MarketingContainer>

          <MarketingContainer>
            <section className="py-8 sm:py-10" data-component="IntegrationFaqs">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <h2 className="text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                  FAQs about {integration.name}
                </h2>
                <p className="mt-2 text-accent">
                  Common setup and usage questions.
                </p>
                <Accordion
                  type="single"
                  collapsible
                  className="mt-6 w-full border-y border-border/60"
                >
                  {faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      id={`faq-${integration.slug}-${i + 1}`}
                      value={`faq-${integration.slug}-${i + 1}`}
                      className="px-0"
                    >
                      <AccordionTrigger className="py-4 text-left text-base font-medium !no-underline hover:!no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-accent">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          </MarketingContainer>

          <MarketingContainer>
            <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
              <RelatedLinks links={relatedLinks} title="Related resources" />
              <div className="pb-10">
                <Link
                  href="/integrations"
                  className="text-sm text-accent hover:text-primary"
                >
                  View all integrations
                </Link>
              </div>
            </div>
          </MarketingContainer>
        </SectionStack>
      </div>
    </main>
  );
}

export default IntegrationsTemplate;
