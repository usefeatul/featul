"use client";

import { useRef } from "react";
import { Container } from "../global/container";
import { Card } from "@featul/ui/components/card";
import type { ComponentType } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  panelClassName: string;
};

const integrations: IntegrationItem[] = [
  {
    slug: "slack",
    name: "Slack",
    description:
      "Get instant Slack alerts when new requests are submitted.",
    status: "Available",
    icon: SlackIcon,
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#36C5F030_0%,transparent_36%),radial-gradient(circle_at_top_right,#2EB67D2E_0%,transparent_38%),radial-gradient(circle_at_bottom_left,#E01E5A22_0%,transparent_34%),radial-gradient(circle_at_bottom_right,#ECB22E24_0%,transparent_36%),linear-gradient(135deg,#f7f0e8_0%,#edf3ec_100%)]",
  },
  {
    slug: "discord",
    name: "Discord",
    description:
      "Send feedback notifications directly into your Discord channels.",
    status: "Available",
    icon: DiscordIcon,
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#5865F240_0%,transparent_42%),radial-gradient(circle_at_bottom_right,#5865F220_0%,transparent_38%),linear-gradient(135deg,#eef1ff_0%,#dfe7ff_100%)]",
  },
  {
    slug: "notra",
    name: "Notra",
    description:
      "Import Notra changelog entries to keep product updates synced.",
    status: "Available",
    icon: NotraIcon,
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#C8B2EE42_0%,transparent_40%),radial-gradient(circle_at_bottom_right,#C8B2EE22_0%,transparent_38%),linear-gradient(135deg,#f4effa_0%,#e5eced_100%)]",
  },
  {
    slug: "nolt",
    name: "Nolt",
    description:
      "Import requests and comments from Nolt into featul.",
    status: "Coming soon",
    icon: NoltIcon,
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#FB736F3D_0%,transparent_38%),radial-gradient(circle_at_bottom_right,#FA6B6620_0%,transparent_34%),linear-gradient(135deg,#fff1f0_0%,#e9f0f2_100%)]",
  },
  {
    slug: "canny",
    name: "Canny",
    description:
      "Bring feature requests and comments over from Canny.",
    status: "Coming soon",
    icon: CannyIcon,
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#525DF940_0%,transparent_40%),radial-gradient(circle_at_bottom_right,#A7ACFC24_0%,transparent_34%),linear-gradient(135deg,#eef0ff_0%,#e4e8f7_100%)]",
  },
  {
    slug: "productboard",
    name: "ProductBoard",
    description:
      "Migrate posts, boards, and comments from ProductBoard.",
    status: "Coming soon",
    icon: ProductBoardIcon,
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#0071E132_0%,transparent_36%),radial-gradient(circle_at_top_right,#FDC50128_0%,transparent_34%),radial-gradient(circle_at_bottom_left,#F6413728_0%,transparent_34%),linear-gradient(135deg,#f6f2ea_0%,#ebf0ec_100%)]",
  },
];

export default function Integrations() {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scrollSlider = (direction: "backward" | "forward") => {
    const slider = sliderRef.current;

    if (!slider) return;

    const amount = Math.max(slider.clientWidth * 0.82, 240);
    slider.scrollBy({
      left: direction === "forward" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section data-component="Integrations" className="my-6 sm:my-8 py-8 sm:py-12">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="max-w-3xl text-left">
            <h2 className="font-heading text-foreground text-2xl sm:text-3xl lg:text-3xl font-semibold">
              Integrate with your favorite tools
            </h2>
            <div className="mt-3 flex items-start gap-2">
              <AccentBar width={8} />
              <p className="text-accent text-sm sm:text-base">
                Connect notifications and imports to centralize feedback workflows.
              </p>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-hide md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:pb-0 lg:grid-cols-3 lg:gap-4"
          >
            {integrations.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={`/integrations/${item.slug}`}
                  className="group block h-full min-w-full shrink-0 snap-start md:min-w-0"
                  aria-label={`Learn more about ${item.name}`}
                >
                  <Card className="h-full gap-0 rounded-md border border-foreground/8 bg-white p-3 shadow-none ring-1 ring-black/5">
                    <div
                      className={`relative overflow-hidden rounded-md border border-black/5 ${item.panelClassName}`}
                    >
                      <div className="flex min-h-[132px] items-center justify-center p-3 sm:min-h-[148px] sm:p-4">
                        <div className="flex min-h-[88px] w-full max-w-[200px] items-center justify-center rounded-md border border-white/70 bg-white px-5 py-6">
                          <Icon className="size-10 sm:size-12" />
                        </div>
                      </div>
                    </div>

                    <div className="px-2 pb-2 pt-4 sm:px-3">
                      <div className="flex items-start gap-3">
                        <h3 className="text-foreground text-xl font-semibold tracking-[-0.02em]">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-accent mt-2.5 text-sm leading-6 sm:text-base">
                        {item.description}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-primary inline-flex items-center gap-2 text-sm font-medium transition-colors group-hover:text-primary/80">
                          Learn more
                          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollSlider("backward")}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:bg-muted"
              aria-label="Scroll integrations backward"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider("forward")}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-white text-foreground transition-colors hover:bg-muted"
              aria-label="Scroll integrations forward"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>
    </Container>
  );
}
