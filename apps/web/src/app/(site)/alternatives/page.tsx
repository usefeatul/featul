import { Container } from "@/components/global/container";
import { getAllAlternatives } from "@/config/alternatives";
import AlternativesList from "@/components/alternatives/list";
import { AlternativesIndexHero } from "@/components/alternatives/index";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Best Featul Alternatives for Feedback & Roadmaps",
  description:
    "Side‑by‑side comparisons covering features, privacy, and hosting differences to help you choose confidently.",
  path: "/alternatives",
});

export default function AlternativesIndexPage() {
  const allAlternatives = getAllAlternatives().sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <main className="min-h-screen overflow-x-clip">
      <AlternativesIndexHero />
      <div className="relative mx-auto max-w-6xl">
        <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14 pb-14 sm:pb-20">
          <section className="mt-4">
            <div className="border-b border-border/70 pb-6 sm:pb-8">
              <p className="text-accent text-[11px] font-medium uppercase tracking-[0.14em]">
                Alternatives
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-heading text-balance text-xl font-bold sm:text-2xl lg:text-3xl">
                  All product comparisons
                </h2>
                <span className="text-accent inline-flex items-center text-xs font-medium">
                  {allAlternatives.length} comparisons
                </span>
              </div>
              <p className="text-accent mt-3 max-w-2xl text-sm sm:text-base">
                Browse our complete list of detailed comparisons. See how Featul
                stacks up against each competitor on features, pricing, and value.
              </p>
            </div>

            <div className="mt-2">
              <AlternativesList items={allAlternatives} />
            </div>
          </section>
        </Container>
      </div>
    </main>
  );
}
