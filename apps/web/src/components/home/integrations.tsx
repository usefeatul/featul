"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlackIcon } from "@featul/ui/icons/slack";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NoltIcon } from "@featul/ui/icons/nolt";
import { CannyIcon } from "@featul/ui/icons/canny";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";
import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { DASHBOARD_BLUR_DATA_URL } from "@/components/layout/sky-banner";
import { HeroSkyDither } from "@/components/layout/sky-dither";
import { APP_URL } from "@/config/auth";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { IntegrationsHeroTab } from "./integrations-hero-tab";

type IntegrationItem = {
  slug: string;
  name: string;
  description: string;
  status: "Available" | "Coming soon";
  icon: ComponentType<{ className?: string; size?: number }>;
};

const integrations: IntegrationItem[] = [
  {
    slug: "slack",
    name: "Slack",
    description: "Get instant Slack alerts when new requests are submitted.",
    status: "Available",
    icon: SlackIcon,
  },
  {
    slug: "discord",
    name: "Discord",
    description:
      "Send feedback notifications directly into your Discord channels.",
    status: "Available",
    icon: DiscordIcon,
  },
  {
    slug: "notra",
    name: "Notra",
    description:
      "Import Notra changelog entries to keep product updates synced.",
    status: "Available",
    icon: NotraIcon,
  },
  {
    slug: "nolt",
    name: "Nolt",
    description: "Import requests and comments from Nolt into Featul.",
    status: "Coming soon",
    icon: NoltIcon,
  },
  {
    slug: "canny",
    name: "Canny",
    description: "Bring feature requests and comments over from Canny.",
    status: "Coming soon",
    icon: CannyIcon,
  },
  {
    slug: "productboard",
    name: "ProductBoard",
    description: "Migrate posts, boards, and comments from ProductBoard.",
    status: "Coming soon",
    icon: ProductBoardIcon,
  },
];

export default function Integrations() {
  return (
    <section
      data-component="Integrations"
      className="relative w-full overflow-hidden"
    >
      <div data-component="IntegrationsHero">
        <MarketingContainer className="relative z-10 pt-12 sm:pt-16 md:pt-20">
          <div className={marketingRailClass}>
            <div className="max-w-3xl text-left">
              <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-[1.1] lg:text-5xl">
                Connect Featul to the tools
                <span className="mt-1 block text-primary">
                  your team already uses.
                </span>
              </h2>
              <p className="text-accent mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">
                Slack alerts, Discord notifications, and import paths from Canny,
                Nolt, and ProductBoard. Feedback stays close to the stack you
                already run.
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-10 min-h-[40px] sm:w-auto">
                  <Link href="/integrations">View all integrations</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-10 min-h-[40px] sm:w-auto"
                >
                  <Link href={APP_URL}>Start for free</Link>
                </Button>
              </div>
            </div>
          </div>
        </MarketingContainer>

        <div className="relative mt-10 sm:mt-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 sm:h-32"
          >
            <HeroSkyDither className="[mask-image:linear-gradient(to_bottom,transparent_0%,black_30%,black_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-stone-900 sm:h-12" />
          </div>

          <MarketingContainer className="relative z-20 -mb-[clamp(12rem,48vw,36rem)]">
            <div className={marketingRailClass}>
              <IntegrationsHeroTab>
                <Image
                  src="/image/dashboard.png"
                  alt="Featul dashboard preview"
                  width={1762}
                  height={1124}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  placeholder="blur"
                  blurDataURL={DASHBOARD_BLUR_DATA_URL}
                  className="block h-auto w-full"
                />
              </IntegrationsHeroTab>
            </div>
          </MarketingContainer>
        </div>
      </div>

      <div className="relative w-full bg-stone-900 pb-16 pt-[clamp(13rem,50vw,38rem)] text-white sm:pb-20">
        <MarketingContainer className="relative z-10">
          <div className={marketingRailClass}>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-stone-950/40">
              <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x lg:grid-cols-3">
                {integrations.map((item) => {
                  const Icon = item.icon;
                  const isAvailable = item.status === "Available";

                  return (
                    <Link
                      key={item.slug}
                      href={`/integrations/${item.slug}`}
                      className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-white/[0.03] sm:p-7"
                      aria-label={`Learn more about ${item.name}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/25">
                          <Icon className="size-4.5" />
                        </span>
                        <span
                          className={cn(
                            "text-[11px] font-medium",
                            isAvailable ? "text-emerald-400" : "text-white/45",
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-white sm:text-lg">
                          {item.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/55">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </MarketingContainer>
      </div>
    </section>
  );
}
