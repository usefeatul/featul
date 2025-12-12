import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { Container } from "@/components/global/container";
import {
  getCategoryBySlug,
  getToolBySlugs,
  getAllToolParams,
} from "@/types/tools";
import { TOOL_COMPONENTS } from "@/types/registry";
import ToolTemplate from "@/components/tools/global/template";
import { createArticleMetadata } from "@/lib/seo";
import { SITE_URL } from "@/config/seo";
import {
  buildToolFaqSchema,
  buildBreadcrumbSchema,
} from "@/lib/structured-data";

type Props = { params: Promise<{ category: string; tool: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, tool: toolSlug } = await params;
  const cat = getCategoryBySlug(category);
  const tool = getToolBySlugs(category, toolSlug);
  if (!cat || !tool) return { title: "Tool" };
  return createArticleMetadata({
    title: tool.name,
    description: tool.description,
    path: `/tools/categories/${category}/${toolSlug}`,
  });
}

export default async function ToolPage({ params }: Props) {
  const { category, tool: toolSlug } = await params;
  const tool = getToolBySlugs(category, toolSlug);
  if (!tool) return notFound();
  const ToolComponent = TOOL_COMPONENTS[category]?.[toolSlug];

  const cat = getCategoryBySlug(category);
  const faqSchema = buildToolFaqSchema({
    tool,
    categoryName: cat?.name || "Tools",
  });
  const breadcrumbSchema = buildBreadcrumbSchema({
    siteUrl: SITE_URL,
    categorySlug: category,
    categoryName: cat?.name || category,
    toolSlug,
    toolName: tool.name,
  });

  return (
    <main className="min-h-screen pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <section className="py-12 sm:py-16" data-component="ToolDetail">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            {/* JSON-LD for SEO: FAQ and Breadcrumbs */}
            <script
              id="tool-faq-jsonld"
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
              id="tool-breadcrumb-jsonld"
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(breadcrumbSchema),
              }}
            />
            {/* Breadcrumb removed for a cleaner tool detail page. */}
            {/* Page-level title and description omitted to avoid duplication; the tool component provides its own content. */}
            {ToolComponent ? <ToolComponent /> : <ToolTemplate tool={tool} />}
          </div>
        </section>
      </Container>
    </main>
  );
}

export function generateStaticParams() {
  return getAllToolParams();
}
