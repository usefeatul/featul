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
        <section>
          <div className="max-w-3xl">
            <h1 className="text-balance text-2xl font-bold sm:text-3xl lg:text-4xl">
              All product comparisons
            </h1>
            <p className="text-accent mt-4 text-sm sm:text-base">
              Browse our complete list of detailed comparisons. See how featul
              stacks up against each competitor on features, pricing, and value.
            </p>
          </div>

          <AlternativesList items={allAlternatives} />
        </section>
      </Container>
    </main>
  );
}
