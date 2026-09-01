import { Container } from "@/components/global/container"
import type { Alternative } from "@/config/alternatives"
import { BookmarkIcon } from "@featul/ui/icons/bookmark"
import { OverlayCard, OverlayCardPanel } from "@/components/shared/overlay-card"

export default function AlternativeGuide({ alt }: { alt: Alternative }) {
  if (!alt.guide?.length) return null

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="AlternativeGuide">
        <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
          <BookmarkIcon aria-hidden className="size-5 text-primary" opacity={1} />
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-accent">
            {alt.name} alternative questions
          </p>
          <div className="mt-8 space-y-4">
            {alt.guide.map((section, index) => (
              <article key={section.title}>
                <OverlayCard className="h-auto">
                  <OverlayCardPanel className="p-5 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/20 text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-balance text-lg font-semibold text-foreground sm:text-xl">
                          {section.title}
                        </h2>
                        {section.answer ? (
                          <p className="mt-3 rounded-lg bg-primary/15 px-3.5 py-3 text-sm leading-6 text-foreground sm:text-[0.95rem] sm:leading-7">
                            {section.answer}
                          </p>
                        ) : null}
                        <p className="mt-3 text-sm leading-6 text-accent sm:leading-7">
                          {section.body}
                        </p>
                      </div>
                    </div>
                  </OverlayCardPanel>
                </OverlayCard>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Container>
  )
}
