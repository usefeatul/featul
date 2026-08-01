import { Container } from "@/components/global/container"
import { SkySection } from "@/components/layout/sky-section"
import { VerticalLines } from "@/components/vertical-lines"
import LegalMarkdown from "@/components/legal/legal-markdown"
import { readLegalMarkdown } from "@/lib/markdown"
import type { LegalSlug } from "@/types/legal"

type LegalPageProps = {
  slug: LegalSlug
}

export default async function LegalPage({ slug }: LegalPageProps) {
  const { content, frontmatter } = await readLegalMarkdown(slug)
  // Title lives in the sky header — drop the leading markdown H1 to avoid a duplicate.
  const body = content.replace(/^#\s+.+\n+/, "")

  return (
    <main className="flex min-h-full flex-1 flex-col overflow-x-clip">
      <SkySection
        data-component="LegalHero"
        className="min-h-[30vh]"
        contentClassName="flex min-h-[30vh] flex-col justify-end pb-8 pt-24 sm:pb-10 sm:pt-28"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="max-w-3xl text-left">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {frontmatter.title}
            </h1>
            {frontmatter.description ? (
              <p className="mt-3 text-base text-foreground/80 sm:text-lg">
                {frontmatter.description}
              </p>
            ) : null}
            {frontmatter.lastUpdated ? (
              <p className="mt-3 text-sm text-foreground/65">
                Last updated: {frontmatter.lastUpdated}
              </p>
            ) : null}
          </div>
        </div>
      </SkySection>

      <div className="relative mx-auto w-full max-w-6xl flex-1">
        <VerticalLines force className="absolute inset-0 z-30" />
        <Container
          maxWidth="6xl"
          className="relative z-10 px-4 pb-12 pt-2 sm:px-10 lg:px-12 xl:px-14"
        >
          <div className="w-full max-w-6xl px-0 sm:px-6">
            <article className="prose prose-sm prose-zinc max-w-3xl text-left prose-headings:text-left sm:prose-base dark:prose-invert">
              <LegalMarkdown markdown={body} />
            </article>
          </div>
        </Container>
      </div>
    </main>
  )
}
