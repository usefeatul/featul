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