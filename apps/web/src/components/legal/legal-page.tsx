import { SkyPageShell } from "@/components/layout/sky-page-shell"
import LegalMarkdown from "@/components/legal/legal-markdown"
import { readLegalMarkdown } from "@/lib/markdown"
import type { LegalSlug } from "@/types/legal"

type LegalPageProps = {
  slug: LegalSlug
}

function stripLegalHeader(markdown: string) {
  // Title + last-updated live in the page header — remove the duplicated markdown intro.
  return markdown
    .replace(/^\s*#\s+.+\r?\n+/, "")
    .replace(/^\s*\*\*Last updated:\*\*[^\n]*\r?\n+/i, "")
    .replace(/^\s*Last updated:\s*[^\n]*\r?\n+/i, "")
    .trimStart()
}

export default async function LegalPage({ slug }: LegalPageProps) {
  const { content, frontmatter } = await readLegalMarkdown(slug)
  const body = stripLegalHeader(content)

  return (
    <SkyPageShell
      dataComponent="LegalPage"
      title={frontmatter.title}
      description={
        <>
          {frontmatter.description ? <p>{frontmatter.description}</p> : null}
          {frontmatter.lastUpdated ? (
            <p className={frontmatter.description ? "mt-3 text-sm" : "text-sm"}>
              Last updated: {frontmatter.lastUpdated}
            </p>
          ) : null}
        </>
      }
    >
      <article className="prose prose-sm prose-zinc max-w-3xl text-left prose-headings:text-left sm:prose-base dark:prose-invert">
        <LegalMarkdown markdown={body} />
      </article>
    </SkyPageShell>
  )
}
