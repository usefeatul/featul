import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativeHero } from "@/components/alternatives/hero";
import FAQs from "@/components/home/faq";
import ComparisonBento from "@/components/alternatives/comparison-bento";
import ComparisonFeature from "@/components/alternatives/comparison-feature";
import StatsSection from "@/components/home/cta";
import {
  getAlternativeBySlug,
  getAlternativeSlugs,
} from "@/config/alternatives";

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
  const title = `${alt.name} vs Feedgot`;
  const description =
    alt.summary ??
    `Compare ${alt.name} to Feedgot across features, privacy, and hosting.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
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
    <main className="min-h-screen pt-16">
      <AlternativeHero alt={alt} />
      <ComparisonBento alt={alt} />
      <ComparisonFeature alt={alt} />
      <FAQs />
      <StatsSection />
    </main>
  );
}
