import { Container } from "@/components/global/container"
import type { Alternative } from "@/config/alternatives"
import { BookmarkIcon } from "@featul/ui/icons/bookmark"

export default function AlternativeGuide({ alt }: { alt: Alternative }) {
  if (!alt.guide?.length) return null

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="AlternativeGuide">
        <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
          <BookmarkIcon aria-hidden className="size-5 text-primary" opacity={1} />
          <p className="mt-6 text-sm leading-6 text-accent">
            Direct answers before you switch from {alt.name}.
          </p>

          <div className="mt-10 border-t border-border/80">
            {alt.guide.map((section) => (
              <article
                key={section.title}
                className="grid gap-4 border-b border-border/80 py-10 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] sm:gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
              >
                <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl sm:leading-snug">
                  {section.title}
                </h2>
                <div className="min-w-0">
                  {section.answer ? (
                    <p className="text-sm leading-7 text-foreground sm:text-base sm:leading-8">
                      {section.answer}
                    </p>
                  ) : null}
                  <p
                    className={
                      section.answer
                        ? "mt-4 text-sm leading-7 text-accent sm:leading-7"
                        : "text-sm leading-7 text-accent sm:text-base sm:leading-8"
                    }
                  >
                    {section.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Container>
  )
}
