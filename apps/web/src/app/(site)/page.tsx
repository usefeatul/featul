import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DEFAULT_DESCRIPTION } from "@/config/seo";
import { Hero } from "@/components/home/hero";
import Faq from "@/components/home/faq";
import StatsSection from "@/components/home/cta";
import Setup from "@/components/home/setup";
import Create from "@/components/home/create";
import Integrations from "@/components/home/integrations";
import Listening from "@/components/home/listening";
import FeaturesSection from "@/components/home/features";
import { ConversionHero } from "@/components/home/conversion";
import { SectionStack } from "@/components/layout/stack";
import { VerticalLines } from "@/components/lines";

export const metadata: Metadata = createPageMetadata({
  title: "Customer Feedback, Roadmaps & Changelogs | Featul",
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <Hero />
      <div className="relative mx-auto max-w-6xl">
        {/* Guide lines scoped to the content below the hero so the sky hero
            stays clean while the rest of the page keeps them. */}
        <VerticalLines force className="absolute inset-0 z-30" />
        <SectionStack>
          <ConversionHero />
          <FeaturesSection />
          <Listening />
          <Integrations />
          <Setup />
          <Create />
          <Faq />
          <StatsSection />
        </SectionStack>
      </div>
    </main>
  );
}
