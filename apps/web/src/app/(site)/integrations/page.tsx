import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Container } from "@/components/global/container";
import { VerticalLines } from "@/components/vertical-lines";
import { INTEGRATIONS } from "@/lib/data/programmatic/content-matrix";
import { SlackIcon } from "@featul/ui/icons/slack";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NoltIcon } from "@featul/ui/icons/nolt";
import { CannyIcon } from "@featul/ui/icons/canny";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";
import { IntegrationIcon } from "@featul/ui/icons/integration";
import type { ComponentType } from "react";

type IconProps = { className?: string; size?: number };

const ICONS: Record<string, ComponentType<IconProps>> = {
  slack: SlackIcon,
  discord: DiscordIcon,
  notra: NotraIcon,
  nolt: NoltIcon,
  canny: CannyIcon,
  productboard: ProductBoardIcon,
};

export const metadata: Metadata = createPageMetadata({
  title: "Integrations - Connect Featul with your tools",
  description:
    "Browse Featul integrations and open setup guides for Slack, Discord, Notra, Nolt, Canny, and ProductBoard.",
  path: "/integrations",
});

export default function IntegrationsIndexPage() {
  return (
    <main className="min-h-screen pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18 relative">
        <VerticalLines className="absolute z-0" />
        <section className="pt-10 md:pt-16 pb-16 relative z-10">
          <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
            <div className="max-w-3xl">
              <h1 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold">
                Integrations
              </h1>
              <p className="text-muted-foreground mt-4 text-base sm:text-lg">
                Connect Featul with your existing tools. Open any integration below
                to view setup details and configuration steps.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {INTEGRATIONS.map((integration) => {
                const Icon = ICONS[integration.slug] ?? IntegrationIcon;
                return (
                  <div
                    key={integration.slug}
                    className="group rounded-md border border-border bg-card p-5 transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-9 items-center justify-center rounded-md border border-border/70 bg-background">
                        <Icon className="size-5" />
                      </span>
                      <Link
                        href={`/integrations/${integration.slug}`}
                        className="text-lg font-semibold text-foreground hover:text-primary"
                      >
                        {integration.name}
                      </Link>
                    </div>
                    <p className="mt-3 text-sm text-accent line-clamp-2">
                      {integration.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="rounded-md border border-border px-2 py-1 text-accent uppercase tracking-wide">
                        {integration.category}
                      </span>
                      <Link
                        href={`/integrations/${integration.slug}`}
                        className="text-primary font-medium hover:underline"
                      >
                        ID: {integration.slug}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
