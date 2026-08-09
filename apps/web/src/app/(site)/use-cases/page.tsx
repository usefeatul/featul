import type { Metadata } from "next";
import { getAllUseCasesForIndex } from "@/types/scenarios";
import { Container } from "@/components/global/container";
import { UseCasesIndexHero } from "@/components/use-cases/index";
import UseCasesList from "@/components/use-cases/list";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Use Cases | Product Feedback & Roadmap Guides",
  description:
    "Explore practical Featul use cases: centralize product feedback, run transparent roadmaps, and keep customers in the loop with changelogs.",
  path: "/use-cases",
});

export default function UseCasesIndexPage() {
  const useCases = getAllUseCasesForIndex();

  return (
    <main className="min-h-screen overflow-x-clip">
      <UseCasesIndexHero />
      <div className="relative mx-auto max-w-6xl">
        <Container
          maxWidth="6xl"
          className="relative z-10 px-4 pb-14 sm:px-10 sm:pb-20 lg:px-12 xl:px-14"
        >
          <section className="mt-4">
            <div className="border-b border-border/70 pb-6 sm:pb-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                Use cases
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-balance font-heading text-xl font-bold sm:text-2xl lg:text-3xl">
                  Guides for real product teams
                </h2>
                <span className="inline-flex items-center text-xs font-medium text-accent">
                  {useCases.length} guide{useCases.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-accent sm:text-base">
                Scenario-based walkthroughs for feedback, roadmaps, growth, and
                customer success.
              </p>
            </div>

            <div className="mt-2">
              <UseCasesList items={useCases} />
            </div>
          </section>
        </Container>
      </div>
    </main>
  );
}
