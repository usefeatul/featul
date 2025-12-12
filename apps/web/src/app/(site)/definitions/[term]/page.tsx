import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import DefinitionDetail from "@/components/definitions/DefinitionDetail"
import DefinedTermJsonLd from "@/components/seo/DefinedTermJsonLd"
import FaqJsonLd from "@/components/seo/FaqJsonLd"
import { createPageMetadata } from "@/lib/seo"
import { getDefinitionBySlug, getAllDefinitionParams, getPrimarySlug } from "@/types/definitions"
import { SITE_URL } from "@/config/seo"
import { buildDefinitionBreadcrumbSchema } from "@/lib/structured-data"
import Script from "next/script"

export async function generateStaticParams() {
  return getAllDefinitionParams()
}

export async function generateMetadata({ params }: { params: Promise<{ term: string }> }): Promise<Metadata> {
  const { term } = await params
  const primary = getPrimarySlug(term)
  const def = primary ? getDefinitionBySlug(primary) : undefined
  if (!def) return {}
  const title = `${def.name} - Definition`
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

  return (
    <>
      <DefinitionDetail def={def} />
      <DefinedTermJsonLd name={def.name} description={def.short} path={`/definitions/${def.slug}`} alternateNames={def.synonyms} />
      {def.faqs && def.faqs.length ? <FaqJsonLd faqs={def.faqs} /> : null}
      <Script
        id="definition-breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildDefinitionBreadcrumbSchema({ siteUrl: SITE_URL, slug: def.slug, name: def.name })) }}
      />
    </>
  )
}
