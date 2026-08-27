import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { BookmarkIcon } from "@featul/ui/icons/bookmark";

export default function AlternativeGuide({ alt }: { alt: Alternative }) {
  if (!alt.guide?.length) return null;

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="AlternativeGuide">
        <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
          <BookmarkIcon aria-hidden className="size-5 text-primary" opacity={1} />
          <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
            {alt.name} vs Featul in practice
          </h2>
          <p className="mt-3 text-accent">
            Longer context for teams comparing {alt.name} alternatives, not just a feature grid.
          </p>
          <div className="mt-10 space-y-10">
            {alt.guide.map((section) => (
              <article key={section.title} className="space-y-3">
                <h3 className="text-base font-medium text-foreground sm:text-lg">
                  {section.title}
                </h3>
                <p className="text-sm leading-7 text-accent sm:text-base">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Container>
  );
}
