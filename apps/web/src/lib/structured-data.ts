import type { ToolItem } from "@/types/tools";

type BuildFaqParams = {
  tool: ToolItem;
  categoryName: string;
};

export function buildToolFaqSchema({ tool, categoryName }: BuildFaqParams) {
  const questions: Array<{ name: string; text: string }> = [];

  // Q1: What is {tool.name}?
  questions.push({
    name: `What is ${tool.name}?`,
    text: tool.description,
  });

  // Q2: How do I calculate {tool.name}? Use the first section with code/body if available
  const calcSection = tool.contentSections?.find(
    (s) => /formula|calculate|calculation|basic/i.test(s.title)
  ) || tool.contentSections?.[0];
  if (calcSection) {
    const calcText = calcSection.code
      ? `${calcSection.body ? calcSection.body + " " : ""}Formula: ${calcSection.code}`
      : calcSection.body || `Use the calculator inputs to compute ${tool.name.toLowerCase()}.`;
    questions.push({
      name: `How do I calculate ${tool.name}?`,
      text: calcText,
    });
  } else {
    questions.push({
      name: `How do I calculate ${tool.name}?`,
      text: `Use the calculator inputs to compute ${tool.name.toLowerCase()}.`,
    });
  }

  // Q3: When is {tool.name} useful?
  questions.push({
    name: `When is ${tool.name} useful?`,
    text: `Use ${tool.name} to make ${categoryName.toLowerCase()} decisions more confidently by quantifying key metrics.`,
  });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.name,
      acceptedAnswer: { "@type": "Answer", text: q.text },
    })),
  };
}

type BuildBreadcrumbParams = {
  siteUrl: string;
  categorySlug: string;
  categoryName: string;
  toolSlug: string;
  toolName: string;
};

export function buildBreadcrumbSchema({
  siteUrl,
  categorySlug,
  categoryName,
  toolSlug,
  toolName,
}: BuildBreadcrumbParams) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Tools",
        item: `${siteUrl}/tools`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${siteUrl}/tools/categories/${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: toolName,
        item: `${siteUrl}/tools/categories/${categorySlug}/${toolSlug}`,
      },
    ],
  };
}

type BuildCategoryBreadcrumbParams = {
  siteUrl: string;
  categorySlug: string;
  categoryName: string;
};

export function buildCategoryBreadcrumbSchema({
  siteUrl,
  categorySlug,
  categoryName,
}: BuildCategoryBreadcrumbParams) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Tools",
        item: `${siteUrl}/tools`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${siteUrl}/tools/categories`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `${siteUrl}/tools/categories/${categorySlug}`,
      },
    ],
  };
}

type BuildCategoryItemListParams = {
  siteUrl: string;
  categorySlug: string;
  categoryName: string;
  tools: ToolItem[];
};

export function buildCategoryItemListSchema({
  siteUrl,
  categorySlug,
  categoryName,
  tools,
}: BuildCategoryItemListParams) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} Tools`,
    numberOfItems: tools.length,
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: `${siteUrl}/tools/categories/${categorySlug}/${t.slug}`,
      description: t.description,
    })),
  };
}

type BuildCategoriesItemListParams = {
  siteUrl: string;
  categories: Array<{ slug: string; name: string; description?: string }>;
};

export function buildCategoriesItemListSchema({
  siteUrl,
  categories,
}: BuildCategoriesItemListParams) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tool Categories",
    numberOfItems: categories.length,
    itemListElement: categories.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: `${siteUrl}/tools/categories/${c.slug}`,
      description: c.description,
    })),
  };
}