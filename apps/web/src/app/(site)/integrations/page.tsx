import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Container } from "@/components/global/container";
import { INTEGRATIONS } from "@/lib/data/programmatic/content-matrix";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@featul/ui/components/card";
import { buttonVariants } from "@featul/ui/components/button";
import { SlackIcon } from "@featul/ui/icons/slack";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NoltIcon } from "@featul/ui/icons/nolt";
import { CannyIcon } from "@featul/ui/icons/canny";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";
import { IntegrationIcon } from "@featul/ui/icons/integration";
import type { ComponentType } from "react";
import { cn } from "@featul/ui/lib/utils";

type IconProps = { className?: string; size?: number };

const ICONS: Record<string, ComponentType<IconProps>> = {
  slack: SlackIcon,
  discord: DiscordIcon,
  notra: NotraIcon,
  nolt: NoltIcon,
  canny: CannyIcon,
  productboard: ProductBoardIcon,
};

const COMING_SOON_SLUGS = new Set(["nolt", "canny", "productboard"]);

export const metadata: Metadata = createPageMetadata({
  title: "Integrations - Connect Featul with your tools",
  description:
    "Browse Featul integrations and open setup guides for Slack, Discord, Notra, Nolt, Canny, and ProductBoard.",
  path: "/integrations",
});

export default function IntegrationsIndexPage() {
  return (
    <main className="min-[height:calc(100vh-64px)] pt-16 bg-background">
      <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
        <section className="py-8 sm:py-12" data-component="IntegrationsIndex">
          <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
            <div className="max-w-3xl">
              <h1 className="font-heading text-balance text-3xl sm:text-4xl lg:text-5xl font-bold">
                Integrations
              </h1>
              <p className="text-accent mt-4 text-base sm:text-lg">
                Connect Featul with your existing tools. Open any integration below
                to view setup details and configuration steps.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {INTEGRATIONS.map((integration) => {
                const Icon = ICONS[integration.slug] ?? IntegrationIcon;
                const isComingSoon = COMING_SOON_SLUGS.has(integration.slug);
                return (
                  <Link
                    key={integration.slug}
                    href={`/integrations/${integration.slug}`}
                    className="group block h-full"
                    aria-label={`Learn more about ${integration.name}`}
                  >
                    <Card className="h-full overflow-hidden py-4 transition group-hover:shadow-sm group-hover:ring-border flex flex-col">
                      <CardHeader className="flex-1 p-5 sm:p-6">
                        <div className="mb-3 flex items-center gap-3">
                          <span className="inline-flex size-9 items-center justify-center rounded-md border border-border/70 bg-background">
                            <Icon className="size-5" />
                          </span>
                          <CardTitle className="text-lg font-medium">{integration.name}</CardTitle>
                        </div>
                        <CardDescription className="mt-1.5 line-clamp-2 text-accent">
                          {integration.description}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter className="mt-auto flex-col items-start gap-3 px-5 pt-0 sm:px-6">
                        <div className="w-full border-t border-dashed border-foreground/15" />
                        <div className="flex w-full items-center gap-2">
                          <span className={cn(buttonVariants({ variant: "nav", size: "xs" }), "text-foreground")}>
                            Learn more
                          </span>
                          {isComingSoon ? (
                            <span className="ml-auto inline-flex h-8 min-w-[88px] items-center justify-center rounded-md border border-border bg-foreground/5 px-3 py-1.5 text-xs font-medium text-accent">
                              Coming soon
                            </span>
                          ) : null}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
