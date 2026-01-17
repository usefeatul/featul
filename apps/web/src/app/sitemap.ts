import type { MetadataRoute } from "next"
import { getPosts } from "@/lib/query"
import { getAllCompetitorSlugs, getAllIntegrationSlugs, getAllUseCaseSlugs } from "@/lib/data/programmatic"
import { getAllCategorySlugs, getAllToolParams } from "@/types/tools"
import { getAllDefinitionSlugs } from "@/types/definitions"
import { SITE_URL } from "@/config/seo"

export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tools/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/alternatives`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/definitions`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/integrations`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/use-cases`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/gdpr`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]

  // Alternatives index: dynamic pages (now using expanded list from content-matrix)
  const alternativeEntries: MetadataRoute.Sitemap = getAllCompetitorSlugs().map((slug) => ({
    url: `${SITE_URL}/alternatives/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  // Integrations pages
  const integrationEntries: MetadataRoute.Sitemap = getAllIntegrationSlugs().map((slug) => ({
    url: `${SITE_URL}/integrations/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  // Use Case pages
  const useCaseEntries: MetadataRoute.Sitemap = getAllUseCaseSlugs().map((slug) => ({
    url: `${SITE_URL}/use-cases/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  // Tools categories and tool detail pages
  const categoryEntries: MetadataRoute.Sitemap = getAllCategorySlugs().map((category) => ({
    url: `${SITE_URL}/tools/categories/${category}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const toolEntries: MetadataRoute.Sitemap = getAllToolParams().map(({ category, tool }) => ({
    url: `${SITE_URL}/tools/categories/${category}/${tool}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.55,
  }))

  const definitionEntries: MetadataRoute.Sitemap = getAllDefinitionSlugs().map((slug) => ({
    url: `${SITE_URL}/definitions/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  // Blog posts (if configured)
  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const posts = (await getPosts())?.posts
    if (Array.isArray(posts) && posts.length > 0) {
      blogEntries = posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.publishedAt ?? now),
        changeFrequency: "monthly",
        priority: 0.6,
      }))
    }
  } catch {
    console.error("Failed to generate blog sitemap entries")
  }

  return [
    ...staticEntries,
    ...alternativeEntries,
    ...integrationEntries,
    ...useCaseEntries,
    ...categoryEntries,
    ...toolEntries,
    ...definitionEntries,
    ...blogEntries,
  ]
}
