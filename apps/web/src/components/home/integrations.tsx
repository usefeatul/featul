"use client";

import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import type { ComponentType } from "react";
import Link from "next/link";
import { SlackIcon } from "@featul/ui/icons/slack";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NoltIcon } from "@featul/ui/icons/nolt";
import { CannyIcon } from "@featul/ui/icons/canny";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";

type IntegrationItem = {
  slug: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string; size?: number }>;
};

const integrations: IntegrationItem[] = [
  {
    slug: "slack",
    name: "Slack",
    description: "Get instant Slack alerts when new requests are submitted.",
    icon: SlackIcon,
  },
  {
    slug: "discord",
    name: "Discord",
    description:
      "Send feedback notifications directly into your Discord channels.",
    icon: DiscordIcon,
  },
  {
    slug: "notra",
    name: "Notra",
    description:
      "Import Notra changelog entries to keep product updates synced.",
    icon: NotraIcon,
  },
  {
    slug: "nolt",
    name: "Nolt",
    description: "Import requests and comments from Nolt into Featul.",
    icon: NoltIcon,
  },
  {
    slug: "canny",
    name: "Canny",
    description: "Bring feature requests and comments over from Canny.",
    icon: CannyIcon,
  },
  {
    slug: "productboard",
    name: "ProductBoard",
    description: "Migrate posts, boards, and comments from ProductBoard.",
    icon: ProductBoardIcon,
  },
];

export default function Integrations() {
  return (
    <MarketingContainer>
      <section
        data-component="Integrations"
        className="my-12 max-w-full sm:my-16"
      >
        <div className={marketingRailClass}>
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Integrate with your favorite tools
          </h2>
          <p className="mt-3 text-accent max-w-2xl text-sm leading-6 sm:text-base">
            Connect notifications, imports, and migration paths so feedback
            stays close to the tools your team already uses.
          </p>

          <div className="mt-9 overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_24px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] sm:mt-12">
            <div className="-mb-px -mr-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {integrations.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={`/integrations/${item.slug}`}
                    className="flex h-full flex-col border-b border-r border-border p-6 transition-colors duration-200 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none sm:p-7"
                  >
                    <h3 className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      <Icon aria-hidden className="size-4 shrink-0" />
                      {item.name}
                    </h3>
                    <p className="mt-6 text-pretty text-sm leading-6 text-accent">
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </MarketingContainer>
  );
}
