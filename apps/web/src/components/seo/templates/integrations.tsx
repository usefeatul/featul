/**
 * IntegrationsTemplate - Smart template for Integration pages
 *
 * Matches marketing sky-hero pattern used on home / alternatives pages.
 */

import Link from "next/link";
import { Container } from "@/components/global/container";
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
import { RelatedLinks } from "@/components/seo/links";
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card";
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

      <div className="relative mx-auto max-w-6xl">
        <SectionStack>
          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            <section className="py-16" data-component="IntegrationBenefits">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <SquareIcon aria-hidden className="size-5 text-primary" />
                <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                  Why connect {integration.name}
                </h2>
                <p className="mt-3 text-accent">
                  What your team gets when Featul and {integration.name} work
                  together.
                </p>
                <ul className="mt-10 grid gap-3 sm:grid-cols-2">
                  {sections.benefits.map((benefit, i) => (
                    <li key={i} className="h-full">
                      <OverlayCard>
                        <OverlayCardPanel className="flex h-full flex-col px-4 py-3 sm:px-5 sm:py-4">
                          <p className="text-sm leading-relaxed text-accent sm:text-base">
                            {benefit.description}
                          </p>
                        </OverlayCardPanel>
                      </OverlayCard>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Container>

          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            <section className="py-16" data-component="IntegrationHowTo">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <SetupIcon aria-hidden className="size-5 text-primary" opacity={1} />
                <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                  How to connect
                </h2>
                <p className="mt-3 text-accent">
                  A short setup path from Featul into {integration.name}.
                </p>
                <ol className="mt-10 grid gap-3 sm:grid-cols-2">
                  {sections.howItWorks.map((step, i) => (
                    <li key={i} className="h-full">
                      <OverlayCard>
                        <OverlayCardPanel className="flex h-full items-start gap-3 px-4 py-3 sm:px-5 sm:py-4">
                          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-foreground">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed text-accent sm:text-base">
                            {step}
                          </span>
                        </OverlayCardPanel>
                      </OverlayCard>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </Container>

          {sections.extra?.length ? (
            <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
              <section className="py-16" data-component="IntegrationGuide">
                <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                  <h2 className="text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                    {integration.name} integrations in more detail
                  </h2>
                  <div className="mt-10 space-y-10">
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
            </Container>
          ) : null}

          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            <section className="py-10 sm:py-14" data-component="IntegrationVerdict">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <OverlayCard>
                  <OverlayCardPanel
                    className="bg-cover bg-center bg-no-repeat p-6 text-left sm:p-8"
                    style={{ backgroundImage: "url(/image/sky.PNG)" }}
                  >
                  <p className="text-sm text-white/85">
                    {meta.h1}
                  </p>
                  <h2 className="mt-3 max-w-2xl text-balance font-heading text-xl font-medium text-white sm:text-2xl lg:text-3xl">
                    Connect {integration.name} and keep feedback moving.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
                    Set up in minutes. Triage where your team already works.
                  </p>
                  <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <HotkeyLink
                      variant="nav"
                      label={`Connect ${integration.name}`}
                      className="h-10 min-h-[40px] w-full min-w-[40px] border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground sm:w-auto"
                    />
                    <LiveDemo className="h-10 min-h-[40px] w-full min-w-[40px] border-white/60 bg-white text-accent hover:bg-white/95 sm:w-auto" />
                  </div>
                  </OverlayCardPanel>
                </OverlayCard>
              </div>
            </section>
          </Container>

          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            <section className="py-16 md:py-24" data-component="IntegrationFaqs">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <div className="max-w-xl">
                  <h2 className="text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                    FAQs about {integration.name}
                  </h2>
                  <p className="mt-3 text-accent">
                    Common setup and usage questions.
                  </p>
                  <Accordion
                    type="single"
                    collapsible
                    className="mt-8 w-full border-y border-border/60"
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
              </div>
            </section>
          </Container>

          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
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
          </Container>
        </SectionStack>
      </div>
    </main>
  );
}

export default IntegrationsTemplate;
