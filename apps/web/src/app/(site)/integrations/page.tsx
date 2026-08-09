import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { Container } from "@/components/global/container";
import { INTEGRATIONS } from "@/lib/data/programmatic/matrix";
import { IntegrationsIndexHero } from "@/components/integrations/index";
import IntegrationsList from "@/components/integrations/list";

export const metadata: Metadata = createPageMetadata({
  title: "Integrations | Connect Featul with your tools",
  description:
    "Connect Featul with Slack, Discord, Notra, and more. Browse setup guides and keep feedback flowing where your team already works.",
  path: "/integrations",
});

export default function IntegrationsIndexPage() {
  const items = [...INTEGRATIONS].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="min-h-screen overflow-x-clip">
      <IntegrationsIndexHero />
      <div className="relative mx-auto max-w-6xl">
        <Container
          maxWidth="6xl"
          className="relative z-10 px-4 pb-14 sm:px-10 sm:pb-20 lg:px-12 xl:px-14"
        >
          <section className="mt-4">
            <div className="border-b border-border/70 pb-6 sm:pb-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                Integrations
              </p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-balance font-heading text-xl font-bold sm:text-2xl lg:text-3xl">
                  All available connections
                </h2>
                <span className="inline-flex items-center text-xs font-medium text-accent">
                  {items.length} integrations
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-accent sm:text-base">
                Open any integration for setup steps, benefits, and how it fits
                into your Featul workflow.
              </p>
            </div>

            <div className="mt-2">
              <IntegrationsList items={items} />
            </div>
          </section>
        </Container>
      </div>
    </main>
  );
}
