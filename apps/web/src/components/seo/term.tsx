import { pageUrl } from "@/lib/seo"
import { serializeJsonLd } from "@/lib/security";

export default function DefinedTermJsonLd({ name, description, path, alternateNames }: { name: string; description: string; path: string; alternateNames?: string[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name,
    description,
    url: pageUrl(path),
    inDefinedTermSet: pageUrl("/definitions"),
    alternateName: alternateNames && alternateNames.length ? alternateNames : undefined,
  }
  return (
    <script
      id="schema-defined-term"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
