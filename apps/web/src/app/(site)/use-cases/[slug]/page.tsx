import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCaseTemplate } from "@/components/seo/templates/usecase";
import { generateUseCasePage } from "@/lib/data/programmatic/generators";
import { getRelatedPages } from "@/lib/seo/interlink";
import { getAllUseCaseSlugs as getAllProgrammaticSlugs } from "@/lib/data/programmatic/matrix";
import { getAllUseCaseSlugs as getOriginalSlugs, getUseCaseBySlug } from "@/types/scenarios";
import { USE_CASE_COMPONENTS } from "@/types/cases";
import { createArticleMetadata } from "@/lib/seo";

/**
 * Generate static params for BOTH:
 * 1. Original custom component use cases (product-feedback-platform, etc.)
 * 2. New programmatic use cases (saas-product-feedback, etc.)
 */
export async function generateStaticParams() {
  const originalSlugs = getOriginalSlugs();
  const programmaticSlugs = getAllProgrammaticSlugs();

  // Combine and dedupe
  const allSlugs = [...new Set([...originalSlugs, ...programmaticSlugs])];
  return allSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Try original system first
  const originalUseCase = getUseCaseBySlug(slug);
  if (originalUseCase) {
    return createArticleMetadata({
      title: originalUseCase.name,
      description: originalUseCase.description,
      path: `/use-cases/${slug}`,
    });
  }

  // Fall back to programmatic
  const pageData = generateUseCasePage(slug);
  if (!pageData) return {};

  return createArticleMetadata({
    title: pageData.meta.title,
    description: pageData.meta.description,
    path: `/use-cases/${slug}`,
  });
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Check if this is an original custom component use case
  const OriginalComponent = USE_CASE_COMPONENTS[slug];
  if (OriginalComponent) {
    return <OriginalComponent />;
  }

  // 2. Fall back to programmatic template
  const pageData = generateUseCasePage(slug);
  if (!pageData) return notFound();

  const relatedLinks = getRelatedPages({
    currentSlug: slug,
    currentType: "use-case",
  });

  return (
    <UseCaseTemplate
      data={pageData}
      relatedLinks={relatedLinks}
    />
  );
}

