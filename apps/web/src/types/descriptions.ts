import { COMPETITORS } from '@/lib/data/programmatic/matrix'

export const alternativeDescriptions: Record<string, string[]> = {
  userjot: [
    "UserJot gives you unlimited users and posts on their free plan, but you'll need external hosting. Featul provides open source flexibility with self hosting and combines feedback, roadmap, and changelog in one platform.",
    "While UserJot includes AI duplicate detection, Featul offers complete transparency through open source architecture and manages your entire feedback lifecycle from collection to release notes.",
    "UserJot's paid tiers focus on branding. Featul emphasizes control through private deployment and roadmap sharing without vendor restrictions.",
  ],
  featurebase: [
    "Featul is an open source Featurebase alternative with EU hosting, self-hosting, and a unified feedback, roadmap, and changelog workflow. Compare pricing and migrate.",
    "Featurebase specializes in voting and a help-center suite. Featul is a self-hostable Featurebase alternative with planning tools, release tracking, and workspace pricing.",
    "Teams that want a simple hosted suite may stay on Featurebase. Teams that need an open source Featurebase alternative choose Featul for self-hosted feedback through changelog.",
  ],
  nolt: [
    "Nolt provides a ten day trial followed by $29 monthly plans with hosting included. Featul offers open source architecture with self hosting and connects feedback, roadmap, and changelog.",
    "Nolt focuses on voting features. Featul expands beyond voting with status management, planning tools, and self hosted release notes.",
    "Teams prioritizing ownership benefit from Featul's open source model which eliminates seat limits while maintaining data privacy.",
  ],
  canny: [
    "Looking for Canny alternatives? Featul is an EU-hosted Canny alternative with Slack, webhooks, API, and Canny import for boards, votes, and discussions.",
    "Canny is known for discovery and a large integration catalog. Featul is a Canny alternative that keeps Slack, webhooks, and API integrations, then adds a public roadmap and changelog.",
    "Skip seat limits with Featul: self-host or use EU hosting, import from Canny, and keep boards, roadmap, and changelog in one workspace.",
  ],
  upvoty: [
    "Upvoty offers trials without permanent free plans, with subscriptions starting around $15 monthly. Featul delivers open source architecture with self hosting and comprehensive feedback, roadmap, and changelog integration.",
    "Upvoty emphasizes voting simplicity. Featul adds public planning capabilities, detailed release notes, and flexible private deployment options.",
    "Teams may choose Upvoty for hosted convenience. Organizations prefer Featul for complete stack ownership with transparent roadmap publication.",
  ],
}

function hashIndex(key: string, length: number): number {
  if (length <= 1) return 0
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h % length
}

function competitorFallbackDescription(slug: string): string | undefined {
  const competitor = COMPETITORS.find((c) => c.slug === slug)
  if (!competitor) return undefined

  const advantage = competitor.victoryPoints[0] || 'EU hosting and a unified feedback workflow'
  return `Looking for ${competitor.name} alternatives? Featul is a privacy-first feedback platform with ${advantage.toLowerCase()}. Compare Featul vs ${competitor.name} on boards, roadmaps, changelogs, and GDPR-friendly hosting.`
}

export function getAltDescription(
  slug: string,
  strategy: 'slug-hash' | 'first' = 'first',
): string {
  const list = alternativeDescriptions[slug] ?? []
  const competitorFallback = competitorFallbackDescription(slug)
  const fallback =
    competitorFallback ??
    `Looking for ${slug} alternatives? Compare Featul vs ${slug} across feedback boards, public roadmaps, and changelogs with privacy-first EU hosting.`

  if (!list.length) return fallback
  if (strategy === 'first') return list[0] ?? fallback

  const idx = hashIndex(slug, list.length)
  return list[idx] ?? fallback
}
