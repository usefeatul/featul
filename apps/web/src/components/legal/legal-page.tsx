import { SkyPageShell } from "@/components/layout/sky-page-shell"
import LegalMarkdown from "@/components/legal/legal-markdown"
import { readLegalMarkdown } from "@/lib/markdown"
import type { LegalSlug } from "@/types/legal"

type LegalPageProps = {
  slug: LegalSlug
}

export default async function LegalPage({ slug }: LegalPageProps) {
  const { content, frontmatter } = await readLegalMarkdown(slug)
  // Title lives in the page header below the sky — drop the leading markdown H1.
  const body = content.replace(/^#\s+.+\n+/, "")

  return (
    <SkyPageShell
      dataComponent="LegalPage"
      title={frontmatter.title}
      description={frontmatter.description}
      meta={
        frontmatter.lastUpdated ? (
          <p className="mb-2 text-sm text-accent">
            Last updated: {frontmatter.lastUpdated}
          </p>
        ) : null
      }
    >
      <article className="prose prose-sm prose-zinc max-w-3xl text-left prose-headings:text-left sm:prose-base dark:prose-invert">
        <LegalMarkdown markdown={body} />
      </article>
    </SkyPageShell>
  )
}
