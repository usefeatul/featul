import { Container } from "@/components/global/container"
import LegalMarkdown from "@/components/legal/legal-markdown"
import { readLegalMarkdown } from "@/lib/markdown"
import type { LegalSlug } from "@/types/legal"

type LegalPageProps = {
  slug: LegalSlug
}

export default async function LegalPage({ slug }: LegalPageProps) {
  const { content } = await readLegalMarkdown(slug)

  return (
    <main>
      <Container withNavbarOffset maxWidth="6xl" className="pt-24 sm:pt-28 pb-12 px-4 sm:px-12 lg:px-16 xl:px-18">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <article className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert text-left prose-headings:text-left mx-auto">
            <LegalMarkdown markdown={content} />
          </article>
        </div>
      </Container>
    </main>
  )
}
