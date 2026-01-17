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

import type { MarblePost } from "@/types/marble";

type BuildBlogPostingParams = {
  siteUrl: string;
  slug: string;
  post: MarblePost;
};

export function buildBlogPostingSchema({ siteUrl, slug, post }: BuildBlogPostingParams) {
  const page = `${siteUrl}/blog/${slug}`;
  const image = post.coverImage ? (post.coverImage.startsWith("http") ? post.coverImage : `${siteUrl}${post.coverImage}`) : `${siteUrl}/og.png`;
  const authors = (post.authors && post.authors.length > 0 ? post.authors : post.author ? [post.author] : [])
    .filter(Boolean)
    .map((a) => ({ "@type": "Person", name: a!.name }));
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    image,
    datePublished: post.publishedAt || undefined,
    mainEntityOfPage: page,
    author: authors.length ? authors : undefined,
    publisher: {
      "@type": "Organization",
      name: "featul",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/og.png`,
      },
    },
  };
}

type BuildBlogBreadcrumbParams = {
  siteUrl: string;
  slug: string;
  title: string;
};

export function buildBlogBreadcrumbSchema({ siteUrl, slug, title }: BuildBlogBreadcrumbParams) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 2, name: title, item: `${siteUrl}/blog/${slug}` },
    ],
  };
}

type BuildDefinitionBreadcrumbParams = {
  siteUrl: string;
  slug: string;
  name: string;
};

export function buildDefinitionBreadcrumbSchema({ siteUrl, slug, name }: BuildDefinitionBreadcrumbParams) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Definitions", item: `${siteUrl}/definitions` },
      { "@type": "ListItem", position: 2, name: name, item: `${siteUrl}/definitions/${slug}` },
    ],
  };
}

type NavItem = { name: string; href: string };

export function buildSiteNavigationSchema(siteUrl: string, items: NavItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: items.map((i) => i.name),
    url: items.map((i) => `${siteUrl}${i.href}`),
  };
}

export function buildSoftwareApplicationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "featul",
    url: siteUrl,
    applicationCategory: "Product feedback, public roadmap, changelog",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    image: `${siteUrl}/og.png`,
  };
}