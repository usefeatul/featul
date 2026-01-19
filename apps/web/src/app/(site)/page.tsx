import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { DEFAULT_DESCRIPTION } from "@/config/seo";
import { Hero } from "@/components/home/hero";
import Faq from "@/components/home/faq";
import StatsSection from "@/components/home/cta";
import Setup from "@/components/home/setup";
import Create from "@/components/home/create";
import Listening from "@/components/home/listening";
import FeaturesSection from "@/components/home/featureTwo";
import { ConversionHero } from "@/components/home/conversion-hero";
import Benefits from "@/components/home/benefits";
import { SectionStack } from "@/components/layout/section-stack";

export const metadata: Metadata = createPageMetadata({
  title: "Customer Feedback, Roadmaps & Changelogs | featul",
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  return (
    <main className="min-h-screen pt-16">
      <div className="mx-auto max-w-6xl">
        <SectionStack>
          <Hero />
          <ConversionHero />
          <Listening />
          <FeaturesSection />
          <Setup />
          <Create />
          <Benefits />
          <Faq />
          <StatsSection />
        </SectionStack>
      </div>
    </main>
  );
}
