import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCaseTemplate } from "@/components/seo/templates/UseCaseTemplate";
import { generateUseCasePage } from "@/lib/data/programmatic/generators";
import { getRelatedPages } from "@/lib/seo/interlink";
import { getAllUseCaseSlugs } from "@/lib/data/programmatic/content-matrix";
import { createArticleMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return getAllUseCaseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
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
  const pageData = generateUseCasePage(slug);

  if (!pageData) return notFound();

  // Get related pages for internal linking
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
