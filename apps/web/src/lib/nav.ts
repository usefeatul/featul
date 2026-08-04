import type { DocsNavSection } from "@/config/docsNav"

/**
 * Derives the current page label from a docs pathname.
 *
 * @param pathname - The current Next.js pathname or null.
 * @returns A human-readable page label.
 */
export function getDocsCurrentPageLabel(pathname: string | null): string {
  if (!pathname) return "Introduction"
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length === 0) return "Introduction"
  const lastPart = parts[parts.length - 1]
  if (!lastPart) return "Introduction"
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, " ")
}

/**
 * Derives the current docs section label from a pathname and section config.
 *
 * @param pathname - The current Next.js pathname or null.
 * @param sections - The docs navigation sections definition.
 * @returns The label of the current section or a default fallback.
 */
export function getDocsCurrentSectionLabel(
  pathname: string | null,
  sections: DocsNavSection[],
): string {
  if (!pathname) return "Getting started"
  for (const section of sections) {
    const hasMatch = section.items.some((item) => item.href === pathname)
    if (hasMatch) return section.label
  }
  return "Getting started"
}

