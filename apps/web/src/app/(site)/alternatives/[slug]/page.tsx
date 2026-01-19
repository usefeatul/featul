import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
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

import { SectionStack } from "@/components/layout/section-stack";
import { SITE_URL } from "@/config/seo";
import { buildAlternativesBreadcrumbSchema } from "@/lib/structured-data";

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
  const title = `${alt.name} vs featul`;
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

  return (
    <main className="pt-16">
      <Script
        id="alternatives-breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildAlternativesBreadcrumbSchema({ siteUrl: SITE_URL, slug, name: alt.name })
          ),
        }}
      />
      <div className="mx-auto max-w-6xl">
        <SectionStack>
          <AlternativeHero alt={alt} />
          <TLDR alt={alt} />
          <Compare alt={alt} />
          <WhyBetter alt={alt} />
          <AlternativeFAQs alt={alt} />
          <StatsSection />
        </SectionStack>
      </div>
    </main>
  );
}
