import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DEFAULT_DESCRIPTION } from "@/config/seo";
import { faqItems } from "@/data/faqs";
import { buildFaqPageSchema } from "@/lib/schema";
import { serializeJsonLd } from "@/lib/security";
import { Hero } from "@/components/home/hero";
import Faq from "@/components/home/faq";
import StatsSection from "@/components/home/cta";
import Setup from "@/components/home/setup";
import Create from "@/components/home/create";
import Integrations from "@/components/home/integrations";
import Listening from "@/components/home/listening";
import FeaturesSection from "@/components/home/features";
import { ConversionHero } from "@/components/home/conversion";
import { PricingSection } from "@/components/home/pricing";
import { SectionStack } from "@/components/layout/stack";

export const metadata: Metadata = createPageMetadata({
  title: "Customer Feedback, Roadmaps & Changelogs | Featul",
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  const faqSchema = buildFaqPageSchema(
    faqItems.map((item) => ({ question: item.question, answer: item.answer })),
  );

  return (
    <main className="min-h-screen overflow-x-clip">
      <script
        id="home-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
      <Hero />
      <div className="relative mx-auto max-w-6xl">
        <SectionStack>
          <ConversionHero />
          <FeaturesSection />
          <Listening />
          <Integrations />
          <Setup />
          <Create />
          <PricingSection />
          <Faq />
          <StatsSection />
        </SectionStack>
      </div>
    </main>
  );
}
