import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IntegrationsTemplate } from "@/components/seo/templates/IntegrationsTemplate";
import { generateIntegrationPage, getAllIntegrationPages } from "@/lib/data/programmatic/generators";
import { getRelatedPages } from "@/lib/seo/interlink";
import { getAllIntegrationSlugs } from "@/lib/data/programmatic/content-matrix";
import { createArticleMetadata } from "@/lib/seo";

export async function generateStaticParams() {
    return getAllIntegrationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const pageData = generateIntegrationPage(slug);
    if (!pageData) return {};

    return createArticleMetadata({
        title: pageData.meta.title,
        description: pageData.meta.description,
        path: `/integrations/${slug}`,
    });
}

export default async function IntegrationPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const pageData = generateIntegrationPage(slug);

    if (!pageData) return notFound();

    // Get related pages for internal linking
    const relatedLinks = getRelatedPages({
        currentSlug: slug,
        currentType: "integration",
    });

    return (
        <IntegrationsTemplate
            data={pageData}
            relatedLinks={relatedLinks}
        />
    );
}
