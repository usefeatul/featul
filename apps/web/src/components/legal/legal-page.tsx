import { SkySection } from "@/components/layout/sky-section"
import { VerticalLines } from "@/components/vertical-lines"
import LegalMarkdown from "@/components/legal/legal-markdown"
import { Container } from "@/components/global/container"
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
    <main className="min-h-screen overflow-x-clip">
      <SkySection data-component="LegalHero" contentClassName="pb-8 pt-14 sm:pb-10 sm:pt-16 md:pb-12">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl [text-shadow:0_1px_8px_rgba(0,0,0,0.2)]">
              {frontmatter.title}
            </h1>
            {frontmatter.description ? (
              <p className="mt-3 text-base text-white/90 sm:text-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.25)]">
                {frontmatter.description}
              </p>
            ) : null}
            {frontmatter.lastUpdated ? (
              <p className="mt-3 text-sm text-white/75 [text-shadow:0_1px_4px_rgba(0,0,0,0.2)]">
                Last updated: {frontmatter.lastUpdated}
              </p>
            ) : null}
          </div>
        </div>
      </SkySection>

      <div className="relative mx-auto max-w-6xl">
        <VerticalLines force className="absolute inset-0 z-30" />
        <Container maxWidth="6xl" className="relative z-10 px-4 pb-12 sm:px-10 lg:px-12 xl:px-14">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <article className="prose prose-sm prose-zinc mx-auto text-left prose-headings:text-left sm:prose-base dark:prose-invert">
              <LegalMarkdown markdown={body} />
            </article>
          </div>
        </Container>
      </div>
    </main>
  )
}
