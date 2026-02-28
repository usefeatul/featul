import { Container } from "../global/container";
import { Card } from "@featul/ui/components/card";
import type { ComponentType } from "react";
import Link from "next/link";
import { SlackIcon } from "@featul/ui/icons/slack";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NoltIcon } from "@featul/ui/icons/nolt";
import { CannyIcon } from "@featul/ui/icons/canny";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";
import { AccentBar } from "@featul/ui/components/cardElements";

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
    description:
      "Get instant Slack alerts when new requests are submitted.",
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
    description:
      "Import requests and comments from Nolt into featul.",
    status: "Coming soon",
    icon: NoltIcon,
  },
  {
    slug: "canny",
    name: "Canny",
    description:
      "Bring feature requests and comments over from Canny.",
    status: "Coming soon",
    icon: CannyIcon,
  },
  {
    slug: "productboard",
    name: "ProductBoard",
    description:
      "Migrate posts, boards, and comments from ProductBoard.",
    status: "Coming soon",
    icon: ProductBoardIcon,
  },
];

export default function Integrations() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section data-component="Integrations" className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-foreground text-2xl sm:text-3xl lg:text-3xl font-semibold">
              Integrate with your favorite tools
            </h2>
            <p className="text-accent mt-3 text-sm sm:text-base">
              Connect notifications and imports to centralize feedback workflows.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            {integrations.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.name}
                  className="p-4 sm:p-4 flex flex-col border border-foreground/10 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex size-9 items-center justify-center rounded-md bg-foreground/5 ring-1 ring-foreground/10">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-foreground text-base font-semibold">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-accent mt-2 text-sm leading-5">
                    {item.description}
                  </p>
                  <div className="mt-3 border-t border-dashed border-foreground/15" />
                  <div
                    className={`mt-3 flex items-center gap-2 ${
                      item.status === "Coming soon" ? "justify-between" : "justify-start"
                    }`}
                  >
                    <Link
                      href={`/integrations/${item.slug}`}
                      className="inline-flex h-8 min-w-[88px] items-center justify-center rounded-md border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/10"
                    >
                      Learn more
                    </Link>
                    {item.status === "Coming soon" ? (
                      <span className="inline-flex h-8 min-w-[88px] items-center justify-center rounded-md border border-border bg-foreground/5 px-3 py-1.5 text-xs font-medium text-accent">
                        {item.status}
                      </span>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex items-start gap-2">
            <AccentBar width={8} />
            <p className="text-accent/80 text-sm">
              Slack, Discord, and Notra are ready now. Nolt, Canny, and ProductBoard imports are next.
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
