import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativeHero } from "@/components/alternatives/hero";
import TLDR from "@/components/alternatives/tldr";
import Compare from "@/components/alternatives/compare";
import WhyBetter from "@/components/alternatives/why";
import AlternativeFAQs from "@/components/alternatives/faq";
import StatsSection from "@/components/home/cta";
import { getAltDescription } from "@/types/descriptions";
import { createArticleMetadata } from "@/lib/seo";
import {
  getAlternativeBySlug,
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
  const title = `${alt.name} vs Featul`;
  const rawDescription = getAltDescription(slug, 'first');
  const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}…` : rawDescription;
  return createArticleMetadata({
    title,
    description,
    path: `/alternatives/${slug}`,
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
      <AlternativeHero alt={alt} />
      <div className="relative mx-auto max-w-6xl">
        <SectionStack>
          <TLDR alt={alt} />
          <Compare alt={alt} />
          <WhyBetter alt={alt} />
          <AlternativeFAQs alt={alt} />
          <RelatedLinks links={relatedLinks} title="Related comparisons" />
          <StatsSection />
        </SectionStack>
      </div>
    </main>
  );
}
