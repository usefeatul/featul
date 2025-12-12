import { Container } from "@/components/global/container"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"
import { readLegalMarkdown } from "@/lib/markdown"
import LegalMarkdown from "@/components/legal/legal-markdown"

export const metadata: Metadata = createPageMetadata({
  title: "GDPR Compliance",
  description: "oreilla’s approach to GDPR and data protection obligations.",
  path: "/gdpr",
})

export default async function GdprPage() {
  const { content } = await readLegalMarkdown("gdpr")
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