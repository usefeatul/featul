/**
 * UseCaseTemplate - Smart template for Use Case pages
 *
 * Matches marketing sky-hero pattern used on home / alternatives / integrations.
 */

import Link from "next/link";
import { Container } from "@/components/global/container";
import { RelatedLinks } from "@/components/seo/links";
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card";
import { UseCaseHero } from "@/components/use-cases/hero";
import { SectionStack } from "@/components/layout/stack";
import { HotkeyLink } from "@/components/global/hotkey";
import { LiveDemo } from "@/components/global/demo";
import type { UseCasePageData } from "@/lib/data/programmatic/generators";
import type { RelatedLink } from "@/lib/seo/interlink";
import { SITE_URL } from "@/config/seo";
import { serializeJsonLd } from "@/lib/security";
import {
  buildFaqPageSchema,
  buildUseCasesBreadcrumbSchema,
} from "@/lib/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@featul/ui/components/accordion";
import { SquareIcon } from "@featul/ui/icons/square";
import { SetupIcon } from "@featul/ui/icons/setup";

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
  const badge = useCase.industry ?? useCase.persona ?? "Use case";

  return (
    <main className="min-h-screen overflow-x-clip">
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

      <UseCaseHero
        title={meta.h1}
        description={sections.intro}
        badge={badge}
      />

      <div className="relative mx-auto max-w-6xl">
        <SectionStack>
          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            <section className="py-16" data-component="UseCaseChallenge">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <SquareIcon aria-hidden className="size-5 text-primary" />
                <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                  The challenge
                </h2>
                <p className="mt-3 text-accent">
                  Common friction points this use case is built to solve.
                </p>
                <ul className="mt-10 space-y-5">
                  {sections.painPoints.map((item, i) => (
                    <li key={i} className="border-b border-border/60 pb-5 last:border-0 last:pb-0">
                      <h3 className="text-base font-medium text-foreground sm:text-lg">
                        {item.problem}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-accent sm:text-base">
                        {item.impact}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Container>

          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            <section className="py-16" data-component="UseCaseSolution">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <SetupIcon aria-hidden className="size-5 text-primary" opacity={1} />
                <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                  How Featul helps
                </h2>
                <p className="mt-3 text-accent">
                  A clearer workflow from feedback intake to shipped updates.
                </p>
                <ul className="mt-10 space-y-5">
                  {sections.solutions.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <div>
                        <h3 className="text-base font-medium text-foreground sm:text-lg">
                          {item.solution}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-accent sm:text-base">
                          {item.benefit}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Container>

          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            <section className="py-10 sm:py-14" data-component="UseCaseVerdict">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <OverlayCard>
                  <OverlayCardPanel
                    className="bg-cover bg-center bg-no-repeat p-6 text-left sm:p-8"
                    style={{ backgroundImage: "url(/image/sky.PNG)" }}
                  >
                  <p className="text-sm text-white/85">{badge}</p>
                  <h2 className="mt-3 max-w-2xl text-balance font-heading text-xl font-medium text-white sm:text-2xl lg:text-3xl">
                    Put this use case into practice with Featul.
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
                    Start free, invite your team, and ship a clearer feedback
                    workflow in minutes.
                  </p>
                  <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <HotkeyLink
                      variant="nav"
                      label="Try Featul free"
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
            <section className="py-16 md:py-24" data-component="UseCaseFaqs">
              <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
                <div className="max-w-xl">
                  <h2 className="text-balance text-2xl font-semibold text-foreground sm:text-3xl">
                    Frequently asked questions
                  </h2>
                  <Accordion
                    type="single"
                    collapsible
                    className="mt-8 w-full border-y border-border/60"
                  >
                    {faqs.map((faq, i) => (
                      <AccordionItem
                        key={i}
                        id={`faq-${useCase.slug}-${i + 1}`}
                        value={`faq-${useCase.slug}-${i + 1}`}
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
                  href="/use-cases"
                  className="text-sm text-accent hover:text-primary"
                >
                  View all use cases
                </Link>
              </div>
            </div>
          </Container>
        </SectionStack>
      </div>
    </main>
  );
}

export default UseCaseTemplate;
