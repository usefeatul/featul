"use client";

import { MarketingContainer, marketingRailClass } from "@/components/layout/container";
import type { ComponentType } from "react";
import Link from "next/link";
import { SlackIcon } from "@featul/ui/icons/slack";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NoltIcon } from "@featul/ui/icons/nolt";
import { CannyIcon } from "@featul/ui/icons/canny";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";
import { AccentBar } from "@featul/ui/components/cardElements";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

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
          <div className="mt-3 flex items-start gap-2">
            <AccentBar width={8} />
            <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
              Connect notifications, imports, and migration paths so feedback
              stays close to the tools your team already uses.
            </p>
          </div>

          <article className={cn(overlayDialogClass, "mt-8")}>
            <div className={cn(overlayInnerClass, "bg-border p-0")}>
              <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
                {integrations.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={`/integrations/${item.slug}`}
                      className="group flex h-full flex-col bg-background px-5 py-5 transition-colors hover:bg-muted/40 sm:px-6 sm:py-6"
                    >
                      <Icon aria-hidden className="size-6" />
                      <h3 className="mt-4 text-sm font-medium text-foreground sm:text-base">
                        {item.name}
                      </h3>
                      <p className="text-accent mt-1.5 text-pretty text-sm leading-6">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </article>
        </div>
      </section>
    </MarketingContainer>
  );
}
