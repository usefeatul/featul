import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import ToolsPageShell from "@/components/tools/global/tool-shell";
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
    <ToolsPageShell dataComponent="ToolDetail" mainClassName="min-h-screen pt-16 bg-background">
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
    </ToolsPageShell>
  );
}

export function generateStaticParams() {
  return getAllToolParams();
}
