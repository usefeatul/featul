import { Container } from "@/components/global/container";
import { getAllAlternatives } from "@/config/alternatives";
import AlternativesList from "@/components/alternatives/list";
import { createPageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/hero";

export const metadata = createPageMetadata({
  title: "Best featul Alternatives for Feedback & Roadmaps",
  description:
    "Side‑by‑side comparisons covering features, privacy, and hosting differences to help you choose confidently.",
  path: "/alternatives",
});

export default function AlternativesIndexPage() {
  const allAlternatives = getAllAlternatives().sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <main className="min-h-screen pt-16">
      <Hero />
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18 pb-14 sm:pb-20">
        <section className="mt-4">
          <div className="border-b border-border/70 pb-6 sm:pb-8">
            <p className="text-accent text-[11px] font-medium uppercase tracking-[0.14em]">
              Alternatives
            </p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <h1 className="text-balance text-xl font-bold sm:text-2xl lg:text-3xl">
                All product comparisons
              </h1>
              <span className="text-accent inline-flex items-center text-xs font-medium">
                {allAlternatives.length} comparisons
              </span>
            </div>
            <p className="text-accent mt-3 max-w-2xl text-sm sm:text-base">
              Browse our complete list of detailed comparisons. See how featul
              stacks up against each competitor on features, pricing, and value.
            </p>
          </div>

          <div className="mt-2">
            <AlternativesList items={allAlternatives} />
          </div>
        </section>
      </Container>
    </main>
  );
}
