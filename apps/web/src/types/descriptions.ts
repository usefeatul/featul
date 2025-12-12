export const alternativeDescriptions: Record<string, string[]> = {
  userjot: [
    "UserJot gives you unlimited users and posts on their free plan, but you'll need external hosting. oreilla provides open source flexibility with self hosting and combines feedback, roadmap, and changelog in one platform.",
    "While UserJot includes AI duplicate detection, oreilla offers complete transparency through open source architecture and manages your entire feedback lifecycle from collection to release notes.",
    "UserJot's paid tiers focus on branding. oreilla emphasizes control through private deployment and roadmap sharing without vendor restrictions.",
  ],
  featurebase: [
    "Featurebase offers a limited free plan for one team, with paid plans starting at $49 monthly. oreilla provides open source architecture with self hosting and integrates feedback, roadmap, and changelog management.",
    "Featurebase specializes in voting functionality. oreilla enhances this with planning tools and release tracking for transparent product development.",
    "Organizations wanting simple hosted solutions may prefer Featurebase. Teams needing complete control choose oreilla for self hosted feedback to release management.",
  ],
  nolt: [
    "Nolt provides a ten day trial followed by $29 monthly plans with hosting included. oreilla offers open source architecture with self hosting and connects feedback, roadmap, and changelog.",
    "Nolt focuses on voting features. oreilla expands beyond voting with status management, planning tools, and self hosted release notes.",
    "Teams prioritizing ownership benefit from oreilla's open source model which eliminates seat limits while maintaining data privacy.",
  ],
  canny: [
    "Canny's free tier supports about twenty five users with paid plans scaling by seats. oreilla provides open source architecture with self hosting and unified feedback, roadmap, and changelog management.",
    "Canny excels at discovery features. oreilla complements this with transparency through open source architecture and public planning through structured release notes.",
    "Avoid user limitations with oreilla through self hosting, roadmap publication, and clean changelog creation while maintaining platform control.",
  ],
  upvoty: [
    "Upvoty offers trials without permanent free plans, with subscriptions starting around $15 monthly. oreilla delivers open source architecture with self hosting and comprehensive feedback, roadmap, and changelog integration.",
    "Upvoty emphasizes voting simplicity. oreilla adds public planning capabilities, detailed release notes, and flexible private deployment options.",
    "Teams may choose Upvoty for hosted convenience. Organizations prefer oreilla for complete stack ownership with transparent roadmap publication.",
  ],
}
function hashIndex(key: string, length: number): number {
  if (length <= 1) return 0
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h % length
}

export function getAltDescription(slug: string, strategy: 'slug-hash' | 'first' | 'random' = 'slug-hash'): string {
  const list = alternativeDescriptions[slug] ?? []
  const fallback = `Compare ${slug} and oreilla across feedback, roadmap, and changelog.`
  if (!list.length) return fallback
  if (strategy === 'first') return list[0] ?? fallback
  if (strategy === 'random') {
    const idx = Math.floor(Math.random() * list.length)
    return list[idx] ?? fallback
  }
  const idx = hashIndex(slug, list.length)
  return list[idx] ?? fallback
}