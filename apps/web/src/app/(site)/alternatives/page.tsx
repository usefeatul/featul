import { Container } from "@/components/global/container";
import { getAllAlternatives } from "@/config/alternatives";
import AlternativesList from "@/components/alternatives/list";
import { AlternativesIndexHero } from "@/components/alternatives/index";
import { createPageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/config/seo";
import { serializeJsonLd } from "@/lib/security";
import { buildAlternativesItemListSchema } from "@/lib/schema";

export const metadata = createPageMetadata({
  title: "Featurebase alternatives & feedback tool comparisons",
  description:
    "Compare Featul with Featurebase, Canny, Nolt, Productboard, and other feedback tools. Side-by-side looks at features, privacy, EU hosting, and open source.",
  path: "/alternatives",
  absoluteTitle: true,
});

export default function AlternativesIndexPage() {
  const allAlternatives = getAllAlternatives().sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <main className="min-h-screen overflow-x-clip">
      <script
        id="alternatives-itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildAlternativesItemListSchema({
              siteUrl: SITE_URL,
              items: allAlternatives.map((item) => ({
                name: item.name,
                slug: item.slug,
              })),
            }),
          ),
        }}
      />
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
                Browse detailed competitor alternatives pages. See how Featul
                stacks up on features, privacy, EU hosting, and roadmaps.
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
