export const NEW_TOOL_SLUGS = new Set<string>([
  "stickiness-calculator",
  "ttfv-calculator",
  "feature-usage-frequency",
])

export function isToolNew(slug: string) {
  return NEW_TOOL_SLUGS.has(slug)
}