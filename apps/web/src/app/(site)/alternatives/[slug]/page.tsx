import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativeHero } from "@/components/alternatives/hero";
import TLDR from "@/components/alternatives/tldr";
import Compare from "@/components/alternatives/compare";
import WhyBetter from "@/components/alternatives/why";
import AlternativeFAQs from "@/components/alternatives/faq";
import Verdict from "@/components/alternatives/verdict";
import { Container } from "@/components/global/container";
import { getAltDescription } from "@/types/descriptions";
import { createArticleMetadata } from "@/lib/seo";
import {
  ALTERNATIVES_UPDATED_ISO,
  getAlternativeBySlug,
  getAlternativePageTitle,
  getAlternativeSlugs,
} from "@/config/alternatives";
import { getRelatedPages } from "@/lib/seo/interlink";
import { RelatedLinks } from "@/components/seo/links";
import { getAlternativeFaq } from "@/data/alt";
import { serializeJsonLd } from "@/lib/security";
import { SectionStack } from "@/components/layout/stack";
import { SITE_URL } from "@/config/seo";
import { buildAlternativesBreadcrumbSchema, buildFaqPageSchema } from "@/lib/schema";

export async function generateStaticParams() {
  return getAlternativeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const alt = getAlternativeBySlug(slug);
  if (!alt) return {};
  const title = getAlternativePageTitle(alt.name);
  const rawDescription = getAltDescription(slug, "first");
  const description =
    rawDescription.length > 160
      ? `${rawDescription.slice(0, 157)}…`
      : rawDescription;
  return createArticleMetadata({
    title,
    description,
    path: `/alternatives/${slug}`,
    absoluteTitle: true,
  });
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const alt = getAlternativeBySlug(slug);
  if (!alt) return notFound();

  const { items: faqItems } = getAlternativeFaq(slug);
  const faqSchema = buildFaqPageSchema(
    faqItems.map((item) => ({ question: item.question, answer: item.answer })),
  );
  const relatedLinks = getRelatedPages({
    currentSlug: slug,
    currentType: "competitor",
  });
  if (slug === "featurebase") {
    relatedLinks.unshift({
      href: "/docs/open-source",
      label: "Featul is open source",
      type: "hub",
    });
  }
  const related = relatedLinks.slice(0, 5);

  return (
    <main className="min-h-screen overflow-x-clip">
      <script
        id="alternatives-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildAlternativesBreadcrumbSchema({ siteUrl: SITE_URL, slug, name: alt.name })
          ),
        }}
      />
      <script
        id="alternatives-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <time dateTime={ALTERNATIVES_UPDATED_ISO} className="sr-only">
        Updated {ALTERNATIVES_UPDATED_ISO}
      </time>
      <AlternativeHero alt={alt} />
      <div className="relative mx-auto max-w-6xl">
        <SectionStack>
          <TLDR alt={alt} />
          <Compare alt={alt} />
          <WhyBetter alt={alt} />
          <Verdict alt={alt} />
          <AlternativeFAQs alt={alt} />
          <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
            <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
              <RelatedLinks links={related} title="Related comparisons" />
            </div>
          </Container>
        </SectionStack>
      </div>
    </main>
  );
}
