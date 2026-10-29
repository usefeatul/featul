import { MarketingContainer, marketingStackClass } from "@/components/layout/container";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativeHero } from "@/components/alternatives/hero";
import TLDR from "@/components/alternatives/tldr";
import Snapshot from "@/components/alternatives/snapshot";
import Compare from "@/components/alternatives/compare";
import WhyBetter from "@/components/alternatives/why";
import AlternativeGuide from "@/components/alternatives/guide";
import AlternativeFAQs from "@/components/alternatives/faq";
import Verdict from "@/components/alternatives/verdict";
import { getAltDescription } from "@/types/descriptions";
import { createArticleMetadata } from "@/lib/seo";
import {
  ALTERNATIVES_UPDATED_ISO,
  getAlternativeBySlug,
  getAlternativePageTitle,
  getAlternativeSlugs,
} from "@/config/alternatives";
import { getAlternativeRelatedLinks } from "@/lib/seo/interlink";
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
  const title = getAlternativePageTitle(alt);
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
  const related = getAlternativeRelatedLinks(slug);

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
      <div className={marketingStackClass}>
        <SectionStack>
          <TLDR alt={alt} />
          <Snapshot alt={alt} />
          <Compare alt={alt} />
          <WhyBetter alt={alt} />
          <AlternativeGuide alt={alt} />
          <Verdict alt={alt} />
          <AlternativeFAQs alt={alt} />
          <MarketingContainer>
            <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
              <RelatedLinks links={related} title="Related comparisons" />
            </div>
          </MarketingContainer>
        </SectionStack>
      </div>
    </main>
  );
}
