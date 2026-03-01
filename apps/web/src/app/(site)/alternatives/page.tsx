import { Container } from "@/components/global/container";
import { alternatives } from "@/config/alternatives";
import AlternativesList from "@/components/alternatives/list";
import { createPageMetadata } from "@/lib/seo";
import { VerticalLines } from "@/components/vertical-lines";

export const metadata = createPageMetadata({
  title: "Best featul Alternatives for Feedback & Roadmaps",
  description:
    "Side‑by‑side comparisons covering features, privacy, and hosting differences to help you choose confidently.",
  path: "/alternatives",
});

export default function AlternativesIndexPage() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18 relative">
      <VerticalLines className="absolute z-0" />
      <section className="pt-10 md:pt-16 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold">
            Alternatives
          </h1>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            Compare featul with similar products. Each page highlights key
            features, privacy, and hosting differences.
          </p>
        </div>

        <AlternativesList items={alternatives} />
      </section>
    </Container>
  );
}
