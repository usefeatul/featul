import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { TocItem as TocItemType } from "@/lib/toc"
import {
  docsSections,
  findDocsNav,
  getDocsNeighbors,
} from "@/config/docsNav"
import { readDocsMarkdown, type DocsPageId } from "@/lib/docs"
import { DocsMarkdown, extractDocsToc } from "@/components/docs/markdown"
import { DocsToc } from "@/components/docs/toc"
import { DocsPager } from "@/components/docs/pager"
import { createPageMetadata } from "@/lib/seo"
import { SITE_URL } from "@/config/seo"
import { buildDocsBreadcrumbSchema } from "@/lib/schema"
import { serializeJsonLd } from "@/lib/security"

type DocsPageParams = {
  slug: string[]
}

type DocsPageProps = {
  params: Promise<DocsPageParams>
}

function resolvePathname(params: { slug: string[] }): string {
  return `/docs/${params.slug.join("/")}`
}

function toTocItems(markdown: string): TocItemType[] {
  const rawItems = extractDocsToc(markdown)
  return rawItems.map((item) => ({
    id: item.id,
    text: item.text,
    level: item.level,
  }))
}

export async function generateStaticParams(): Promise<DocsPageParams[]> {
  const params: DocsPageParams[] = []

  for (const section of docsSections) {
    for (const item of section.items) {
      const segments = item.href.replace("/docs/", "").split("/").filter(Boolean)
      if (segments.length) params.push({ slug: segments })
    }
  }

  return params
}

export async function generateMetadata(props: DocsPageProps): Promise<Metadata> {
  const params = await props.params
  const pathname = resolvePathname(params)
  const nav = findDocsNav(pathname)
  if (!nav) notFound()

  const docs = await readDocsMarkdown(nav.item.id as DocsPageId)
  const title = docs.frontmatter.title ?? nav.item.label
  const description =
    docs.frontmatter.description ||
    `${title} — Featul documentation for product feedback, roadmaps, and changelogs.`

  return createPageMetadata({
    title,
    description,
    path: pathname,
  })
}

export default async function DocsPage(props: DocsPageProps) {
  const params = await props.params
  const pathname = resolvePathname(params)
  const nav = findDocsNav(pathname)
  if (!nav) notFound()

  const docs = await readDocsMarkdown(nav.item.id as DocsPageId)
  const tocItems: TocItemType[] = toTocItems(docs.content)
  const pageTitle = docs.frontmatter.title ?? nav.item.label
  const { prev, next } = getDocsNeighbors(pathname)
  const breadcrumbSchema = buildDocsBreadcrumbSchema({
    siteUrl: SITE_URL,
    pathname,
    sectionLabel: nav.sectionLabel,
    pageTitle,
  })

  return (
    <div className="flex items-start gap-8">
      <script
        id="docs-breadcrumb-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />

      <article className="min-w-0 flex-1">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-foreground/45">
            {nav.sectionLabel}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="min-w-0 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.15rem]">
              {pageTitle}
            </h1>
            <div className="shrink-0 pt-1">
              <DocsPager prev={prev} next={next} />
            </div>
          </div>
          {docs.frontmatter.description ? (
            <p className="mt-3 text-lg leading-8 text-foreground/55">
              {docs.frontmatter.description}
            </p>
          ) : null}
        </header>
        <DocsMarkdown markdown={docs.content} />
      </article>

      <aside className="hidden w-40 shrink-0 xl:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide">
          <DocsToc items={tocItems} />
        </div>
      </aside>
    </div>
  )
}
