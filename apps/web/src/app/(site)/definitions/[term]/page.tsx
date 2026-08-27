import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import DefinitionDetail from "@/components/definitions/detail"
import DefinedTermJsonLd from "@/components/seo/term"
import FaqJsonLd from "@/components/seo/jsonld"
import { createPageMetadata } from "@/lib/seo"
import { getDefinitionBySlug, getAllDefinitionParams, getPrimarySlug } from "@/content/definitions"
import { SITE_URL } from "@/config/seo"
import { buildDefinitionBreadcrumbSchema } from "@/lib/schema"
import { getRelatedPages } from "@/lib/seo/interlink";
import { RelatedLinks } from "@/components/seo/links";
import { serializeJsonLd } from "@/lib/security";

export async function generateStaticParams() {
  return getAllDefinitionParams()
}

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const { term } = await params
  const primary = getPrimarySlug(term)
  const def = primary ? getDefinitionBySlug(primary) : undefined
  if (!def) return {}
  const title = def.metaTitle ?? `${def.name} - Definition`
  const desc = def.short
  return createPageMetadata({ title, description: desc, path: `/definitions/${def.slug}` })
}

export default async function DefinitionPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = await params
  const primary = getPrimarySlug(term)
  if (!primary) return notFound()
  if (primary !== term) redirect(`/definitions/${primary}`)
  const def = getDefinitionBySlug(primary)
  if (!def) return notFound()

  const relatedLinks = getRelatedPages({
    currentSlug: def.slug,
    currentType: "definition",
  })

  return (
    <>
      <DefinitionDetail def={def} />
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-10 lg:px-12 xl:px-14">
        <RelatedLinks links={relatedLinks} title="Related resources" />
      </div>
      <DefinedTermJsonLd name={def.name} description={def.short} path={`/definitions/${def.slug}`} alternateNames={def.synonyms} />
      {def.faqs && def.faqs.length ? <FaqJsonLd faqs={def.faqs} /> : null}
      <script
        id="definition-breadcrumb-jsonld"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildDefinitionBreadcrumbSchema({ siteUrl: SITE_URL, slug: def.slug, name: def.name }),
          ),
        }}
      />
    </>
  )
}
