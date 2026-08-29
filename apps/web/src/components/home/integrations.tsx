"use client";

import { Container } from "../global/container";
import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SlackIcon } from "@featul/ui/icons/slack";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NoltIcon } from "@featul/ui/icons/nolt";
import { CannyIcon } from "@featul/ui/icons/canny";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";
import { AccentBar } from "@featul/ui/components/cardElements";
import {
  overlayChipInnerClass,
  overlayChipShellClass,
  overlayDialogClass,
  overlayInnerClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import type { PixelColor } from "@/components/dither-kit/pixel";
import { HorizontalScrollControls } from "./scroll";
import { VisualCardIconTile, VisualCardWell } from "./visual-well";

type IntegrationItem = {
  slug: string;
  name: string;
  description: string;
  status: "Available" | "Coming soon";
  icon: ComponentType<{ className?: string; size?: number }>;
  color: PixelColor;
};

const integrations: IntegrationItem[] = [
  {
    slug: "slack",
    name: "Slack",
    description: "Get instant Slack alerts when new requests are submitted.",
    status: "Available",
    icon: SlackIcon,
    color: "green",
  },
  {
    slug: "discord",
    name: "Discord",
    description:
      "Send feedback notifications directly into your Discord channels.",
    status: "Available",
    icon: DiscordIcon,
    color: "purple",
  },
  {
    slug: "notra",
    name: "Notra",
    description:
      "Import Notra changelog entries to keep product updates synced.",
    status: "Available",
    icon: NotraIcon,
    color: "pink",
  },
  {
    slug: "nolt",
    name: "Nolt",
    description: "Import requests and comments from Nolt into Featul.",
    status: "Coming soon",
    icon: NoltIcon,
    color: "red",
  },
  {
    slug: "canny",
    name: "Canny",
    description: "Bring feature requests and comments over from Canny.",
    status: "Coming soon",
    icon: CannyIcon,
    color: "blue",
  },
  {
    slug: "productboard",
    name: "ProductBoard",
    description: "Migrate posts, boards, and comments from ProductBoard.",
    status: "Coming soon",
    icon: ProductBoardIcon,
    color: "orange",
  },
];

export default function Integrations() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section
        data-component="Integrations"
        className="my-16 max-w-full overflow-x-clip sm:my-20"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl text-left">
              <h2 className="font-heading text-foreground text-2xl font-semibold sm:text-3xl lg:text-3xl">
                Integrate with your favorite tools
              </h2>
              <div className="mt-3 flex items-start gap-2">
                <AccentBar width={8} />
                <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
                  Connect notifications, imports, and migration paths so
                  feedback stays close to the tools your team already uses.
                </p>
              </div>
            </div>

            <HorizontalScrollControls
              targetId="home-integrations-slider"
              className="flex shrink-0 items-center gap-2 self-end"
              backwardLabel="Show previous integrations"
              forwardLabel="Show next integrations"
            />
          </div>

          <div className="relative mt-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent sm:w-12"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent sm:w-12"
            />

            <div
              id="home-integrations-slider"
              className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [-webkit-overflow-scrolling:touch] lg:gap-4"
              role="region"
              aria-label="Integrations carousel"
              tabIndex={0}
            >
              {integrations.map((item) => {
                const Icon = item.icon;
                const isAvailable = item.status === "Available";

                return (
                  <Link
                    key={item.name}
                    href={`/integrations/${item.slug}`}
                    className="group block w-[min(82vw,280px)] shrink-0 snap-start sm:w-[min(46vw,300px)] lg:w-[min(32vw,310px)]"
                    aria-label={`Learn more about ${item.name}`}
                  >
                    <article
                      className={cn(overlayDialogClass, "flex h-full flex-col")}
                    >
                      <div
                        className={cn(
                          overlayInnerClass,
                          "mb-2 flex min-h-[168px] flex-1 flex-col p-0 sm:min-h-[188px]",
                        )}
                      >
                        <VisualCardWell
                          color={item.color}
                          className="min-h-[168px] sm:min-h-[188px]"
                          badge={
                            <span className={overlayChipShellClass}>
                              <span
                                className={cn(
                                  overlayChipInnerClass,
                                  "h-5 min-h-5 gap-1.5 px-1.5 text-[11px] font-medium",
                                  isAvailable
                                    ? "text-emerald-700"
                                    : "text-accent",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    isAvailable
                                      ? "bg-emerald-500"
                                      : "bg-amber-400",
                                  )}
                                />
                                {item.status}
                              </span>
                            </span>
                          }
                        >
                          <VisualCardIconTile>
                            <Icon className="size-8 sm:size-9" />
                          </VisualCardIconTile>
                        </VisualCardWell>
                      </div>

                      <div
                        className={cn(
                          overlayInnerClass,
                          "flex flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4",
                        )}
                      >
                        <h3 className="text-foreground text-lg font-semibold tracking-[-0.02em]">
                          {item.name}
                        </h3>
                        <p className="text-accent mt-2 flex-1 text-sm leading-6">
                          {item.description}
                        </p>
                        <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors group-hover:text-primary/80">
                          Learn more
                          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
