"use client";

import { Container } from "../global/container";
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
import type { PixelColor } from "@/components/dither-kit/pixel";
import { DitherGradient } from "@/components/dither-kit/gradient";

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
    color: "grey",
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
        className="my-12 max-w-full sm:my-16"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
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

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((item) => {
              const Icon = item.icon;
              const isAvailable = item.status === "Available";

              return (
                <Link
                  key={item.name}
                  href={`/integrations/${item.slug}`}
                  className="group block h-full"
                  aria-label={`Learn more about ${item.name}`}
                >
                  <article className={cn(overlayDialogClass, "h-full")}>
                    <div
                      className={cn(
                        overlayInnerClass,
                        "flex h-full min-h-[4.5rem] items-stretch",
                      )}
                    >
                      <div className="relative flex w-[3.75rem] shrink-0 items-center justify-center overflow-hidden sm:w-16">
                        <DitherGradient
                          from={item.color}
                          to="transparent"
                          direction="right"
                          cell={3}
                          bloom="low"
                          opacity={isAvailable ? 0.88 : 0.45}
                          className="[mask-image:linear-gradient(to_right,black_15%,transparent_92%)]"
                        />
                        <Icon className="relative z-10 size-6" />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2.5 pr-3.5">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-foreground sm:text-base">
                            {item.name}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] font-medium",
                              isAvailable ? "text-emerald-700" : "text-accent",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                isAvailable ? "bg-emerald-500" : "bg-amber-400",
                              )}
                            />
                            {item.status}
                          </span>
                        </div>
                        <p className="text-accent mt-0.5 line-clamp-2 text-xs leading-5 sm:text-sm sm:leading-5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Container>
  );
}
