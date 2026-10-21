import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo"
import type { TocItem as TocItemType } from "@/lib/toc"
import {
  DOCS_HOME_HREF,
  docsSections,
  findDocsNav,
  getDocsNeighbors,
} from "@/config/docsNav"
import { docsReadingMinutes, getDocsArticles, readDocsMarkdown, type DocsPageId } from "@/lib/docs"
import { DocsMarkdown, extractDocsToc } from "@/components/docs/markdown"
import { DocsToc } from "@/components/docs/toc"
import { DocsSearch } from "@/components/docs/search"
import { DocsNavTree } from "@/components/docs/nav-tree"
import { DocsBreadcrumbs, DocsMobileArticleNav } from "@/components/docs/article-nav"
import { DocsStillStuck } from "@/components/docs/ask"
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

/** Laid out like a help center article: search and tree on the left, outline and ask card on the right. */
export default async function DocsPage(props: DocsPageProps) {
  const params = await props.params
  const pathname = resolvePathname(params)
  const nav = findDocsNav(pathname)
  if (!nav) notFound()

  const [docs, articles] = await Promise.all([
    readDocsMarkdown(nav.item.id as DocsPageId),
    getDocsArticles(),
  ])
  const tocItems: TocItemType[] = toTocItems(docs.content)
  const pageTitle = docs.frontmatter.title ?? nav.item.label
  const { prev, next } = getDocsNeighbors(pathname)
  const section = docsSections.find((s) => s.label === nav.sectionLabel)
  const breadcrumbSchema = buildDocsBreadcrumbSchema({
    siteUrl: SITE_URL,
    pathname,
    sectionLabel: nav.sectionLabel,
    pageTitle,
  })

  return (
    <section className="flex flex-1 flex-col">
      <script
        id="docs-breadcrumb-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />

      <div className="grid flex-1 grid-cols-1 gap-10 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)_13rem]">
        {/* Rails stick at the spot they start (10.5rem = site pt-10 + docs sm:pt-32), so only the article moves. */}
        <aside className="hidden md:block">
          <div data-docs-rail className="sticky top-42 max-h-[calc(100dvh-10.5rem)] space-y-6 overflow-y-auto pb-6 [scrollbar-width:none]">
            <DocsSearch articles={articles} size="sm" />
            <DocsNavTree />
          </div>
        </aside>

        <article className="min-w-0 max-w-[42rem]">
          <DocsBreadcrumbs
            items={[
              { label: "Docs", href: DOCS_HOME_HREF },
              ...(section?.items[0] ? [{ label: section.label, href: section.items[0].href }] : []),
              { label: pageTitle },
            ]}
          />
          <h1 className="mt-5 text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:mt-6 sm:text-[2.125rem]">
            {pageTitle}
          </h1>
          {docs.frontmatter.description ? (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {docs.frontmatter.description}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted">
                <FeatulLogoIcon size={14} />
              </span>
              <span className="font-medium text-foreground">Featul</span>
            </span>
            <span>{docsReadingMinutes(docs.content)} min read</span>
          </div>

          <DocsMobileArticleNav
            headings={tocItems}
            sectionLabel={nav.sectionLabel}
            siblings={section?.items ?? []}
            activeHref={pathname}
          />

          <div className="mb-8 mt-6 border-t border-border/60 dark:border-white/[0.07]" />
          <DocsMarkdown markdown={docs.content} />

          {prev || next ? (
            <nav
              aria-label="More docs"
              className="mt-12 grid gap-x-10 gap-y-4 border-t border-border/60 pt-8 sm:grid-cols-2 dark:border-white/[0.07]"
            >
              {prev ? (
                <Link href={prev.href} className="group">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowLeft aria-hidden className="size-3.5" strokeWidth={1.5} /> Previous
                  </span>
                  <span className="mt-1 block truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {prev.label}
                  </span>
                </Link>
              ) : null}
              {next ? (
                <Link href={next.href} className="group text-right sm:col-start-2">
                  <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                    Next <ArrowRight aria-hidden className="size-3.5" strokeWidth={1.5} />
                  </span>
                  <span className="mt-1 block truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {next.label}
                  </span>
                </Link>
              ) : null}
            </nav>
          ) : null}

          <div className="mt-10 lg:hidden">
            <DocsStillStuck />
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-42 max-h-[calc(100dvh-10.5rem)] space-y-10 overflow-y-auto pb-6">
            <DocsToc items={tocItems} />
            <DocsStillStuck />
          </div>
        </aside>
      </div>
    </section>
  )
}
