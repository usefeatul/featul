import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { TocItem as TocItemType } from "@/lib/toc"
import { docsSections } from "@/config/docsNav"
import { readDocsMarkdown, type DocsPageId } from "@/lib/docs-markdown"
import { DocsMarkdown, extractDocsToc } from "@/components/docs/DocsMarkdown"
import { DocsToc } from "@/components/docs/DocsToc"

type DocsPageParams = {
  slug?: string[]
}

type DocsPageProps = {
  params: Promise<DocsPageParams>
}

function resolvePathname(params: { slug?: string[] }): string {
  const segments = params.slug ?? []
  if (!segments.length) {
    return "/docs/getting-started"
  }
  return `/docs/${segments.join("/")}`
}

function findNavItem(pathname: string) {
  for (const section of docsSections) {
    for (const item of section.items) {
      if (item.href === pathname) {
        return { sectionLabel: section.label, item }
      }
    }
  }
  return null
}

function toTocItems(markdown: string): TocItemType[] {
  const rawItems = extractDocsToc(markdown)
  return rawItems.map((item) => ({
    id: item.id,
    text: item.text,
    level: item.level,
  }))
}

export async function generateMetadata(props: DocsPageProps): Promise<Metadata> {
  const params = await props.params
  const pathname = resolvePathname(params)
  const nav = findNavItem(pathname)
  if (!nav) {
    notFound()
  }

  return {
    title: nav.item.label,
  }
}

export default async function DocsPage(props: DocsPageProps) {
  const params = await props.params
  const pathname = resolvePathname(params)
  const nav = findNavItem(pathname)
  if (!nav) {
    notFound()
  }

  const docs = await readDocsMarkdown(nav.item.id as DocsPageId)
  const tocItems: TocItemType[] = toTocItems(docs.content)

  return (
    <>
      {/* Fixed TOC on the right */}
      <aside className="hidden xl:block pointer-events-none fixed top-10 right-1 sm:right-1 lg:right-2 2xl:right-3 z-20">
        <div className="w-64 max-w-xs pointer-events-auto">
          <DocsToc items={tocItems} />
        </div>
      </aside>

      <section>
        <div className="max-w-2xl lg:max-w-3xl space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center rounded-sm bg-card border border-border px-2 py-0.5 text-xs font-medium text-accent">
              {nav.sectionLabel}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
              {docs.frontmatter.title ?? nav.item.label}
            </h1>
            {docs.frontmatter.description && (
              <p className="text-sm sm:text-base text-accent max-w-xl">
                {docs.frontmatter.description}
              </p>
            )}
          </div>
          <DocsMarkdown markdown={docs.content} />
        </div>
      </section>
    </>
  )
}

