import type { Metadata } from "next"
import Link from "next/link"
import { DEFINITIONS } from "@/content/definitions"
import { TOOL_CATEGORIES } from "@/types/tools"
import { SkyPageShell } from "@/components/layout/shell"
import { createPageMetadata } from "@/lib/seo"
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card"

export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Search Featul",
    description:
      "Search Featul definitions, calculators, and resources for SaaS metrics, product feedback, and growth.",
    path: "/search",
  }),
  robots: { index: false, follow: true },
}

type Props = {
  searchParams: Promise<{ q?: string }>
}

function normalizeQuery(input?: string) {
  return input?.trim().toLowerCase() ?? ""
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = normalizeQuery(q)

  const definitionResults = query
    ? DEFINITIONS.filter(
        (def) =>
          def.slug.includes(query) ||
          def.name.toLowerCase().includes(query) ||
          def.short.toLowerCase().includes(query) ||
          (def.synonyms ?? []).some((synonym) => synonym.toLowerCase().includes(query)),
      ).slice(0, 12)
    : []

  const toolResults = query
    ? TOOL_CATEGORIES.flatMap((category) =>
        category.tools
          .filter(
            (tool) =>
              tool.slug.includes(query) ||
              tool.name.toLowerCase().includes(query) ||
              tool.description.toLowerCase().includes(query),
          )
          .map((tool) => ({
            categorySlug: category.slug,
            tool,
          })),
      ).slice(0, 12)
    : []

  const hasQuery = query.length > 0
  const hasResults = definitionResults.length > 0 || toolResults.length > 0

  return (
    <SkyPageShell
      dataComponent="Search"
      title="Search"
      description="Find definitions, calculators, and resources across Featul."
    >
      <form action="/search" method="get" className="mb-8 max-w-xl">
        <label htmlFor="site-search" className="sr-only">
          Search
        </label>
        <div className="flex gap-2">
          <input
            id="site-search"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            placeholder="Search definitions and tools…"
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Search
          </button>
        </div>
      </form>

      {!hasQuery ? (
        <p className="text-sm text-accent">Enter a term to search definitions and calculators.</p>
      ) : null}

      {hasQuery && !hasResults ? (
        <p className="text-sm text-accent">No results for “{q}”. Try a metric name like MRR or churn.</p>
      ) : null}

      {definitionResults.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Definitions</h2>
          <ul className="space-y-3">
            {definitionResults.map((def) => (
              <li key={def.slug}>
                <Link href={`/definitions/${def.slug}`} className="group block">
                  <OverlayCard>
                    <OverlayCardPanel className="px-4 py-3">
                      <p className="font-medium text-foreground group-hover:text-primary">
                        {def.name}
                      </p>
                      <p className="mt-1 text-sm text-accent">{def.short}</p>
                    </OverlayCardPanel>
                  </OverlayCard>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {toolResults.length > 0 ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Tools &amp; Calculators</h2>
          <ul className="space-y-3">
            {toolResults.map(({ categorySlug, tool }) => (
              <li key={`${categorySlug}-${tool.slug}`}>
                <Link
                  href={`/tools/categories/${categorySlug}/${tool.slug}`}
                  className="group block"
                >
                  <OverlayCard>
                    <OverlayCardPanel className="px-4 py-3">
                      <p className="font-medium text-foreground group-hover:text-primary">
                        {tool.name}
                      </p>
                      <p className="mt-1 text-sm text-accent">{tool.description}</p>
                    </OverlayCardPanel>
                  </OverlayCard>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </SkyPageShell>
  )
}
