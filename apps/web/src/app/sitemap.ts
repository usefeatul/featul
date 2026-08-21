import type { MetadataRoute } from "next"
import { getPosts } from "@/lib/query"
import { getAllCompetitorSlugs, getAllIntegrationSlugs, getAllUseCaseSlugs } from "@/lib/data/programmatic"
import { getAllUseCaseSlugs as getOriginalUseCaseSlugs } from "@/types/scenarios"
import { getAllCategorySlugs, getAllToolParams } from "@/types/tools"
import { getAllDefinitionSlugs, getDefinitionLastModified } from "@/content/definitions"
import { docsSections } from "@/config/docsNav"
import { absoluteUrl } from "@/config/seo"

export const revalidate = 86400

function parseDate(input?: string | null): Date | undefined {
  if (!input) return undefined
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  let latestBlogDate: Date | undefined
  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const posts = (await getPosts())?.posts
    if (Array.isArray(posts) && posts.length > 0) {
      blogEntries = posts.map((p) => {
        const published = parseDate(p.publishedAt) ?? now
        if (!latestBlogDate || published > latestBlogDate) {
          latestBlogDate = published
        }
        return {
          url: absoluteUrl(`/blog/${p.slug}`),
          lastModified: published,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }
      })
    }
  } catch {
    console.error("Failed to generate blog sitemap entries")
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/pricing"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    {
      url: absoluteUrl("/blog"),
      lastModified: latestBlogDate ?? now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    { url: absoluteUrl("/tools"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/tools/categories"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/alternatives"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/definitions"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/integrations"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/use-cases"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/gdpr"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]

  const alternativeEntries: MetadataRoute.Sitemap = getAllCompetitorSlugs().map((slug) => ({
    url: absoluteUrl(`/alternatives/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const integrationEntries: MetadataRoute.Sitemap = getAllIntegrationSlugs().map((slug) => ({
    url: absoluteUrl(`/integrations/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const useCaseSlugs = [...new Set([...getOriginalUseCaseSlugs(), ...getAllUseCaseSlugs()])]
  const useCaseEntries: MetadataRoute.Sitemap = useCaseSlugs.map((slug) => ({
    url: absoluteUrl(`/use-cases/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const categoryEntries: MetadataRoute.Sitemap = getAllCategorySlugs().map((category) => ({
    url: absoluteUrl(`/tools/categories/${category}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const toolEntries: MetadataRoute.Sitemap = getAllToolParams().map(({ category, tool }) => ({
    url: absoluteUrl(`/tools/categories/${category}/${tool}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.55,
  }))

  const definitionEntries: MetadataRoute.Sitemap = getAllDefinitionSlugs().map((slug) => ({
    url: absoluteUrl(`/definitions/${slug}`),
    lastModified: getDefinitionLastModified(slug) ?? now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const docsEntries: MetadataRoute.Sitemap = docsSections.flatMap((section) =>
    section.items.map((item) => ({
      url: absoluteUrl(item.href),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  )

  return [
    ...staticEntries,
    ...alternativeEntries,
    ...integrationEntries,
    ...useCaseEntries,
    ...categoryEntries,
    ...toolEntries,
    ...definitionEntries,
    ...docsEntries,
    ...blogEntries,
  ]
}
