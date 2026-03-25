import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Card } from "@featul/ui/components/card";
import { AccentBar } from "@featul/ui/components/cardElements";
import { Container } from "../global/container";
import { HorizontalScrollControls } from "./horizontal-scroll-controls";

const features = [
  {
    title: "Feedback Boards",
    description:
      "Collect ideas, bugs, and feature requests in branded boards where customers can vote and add context.",
    href: "/docs/getting-started/create-boards",
    image: "/image/dashboard.png",
    alt: "Public feedback board showing customer requests and voting",
    imageClassName: "object-cover object-left-top",
    imageFrameClassName: "sm:mr-10",
    panelClassName:
      "bg-[radial-gradient(circle_at_top,#f4dcc1_0%,transparent_52%),linear-gradient(135deg,#f7f1e6_0%,#e5e8e1_100%)]",
  },
  {
    title: "Feedback Dashboard",
    description:
      "Review every request in one place, filter by board and status, and prioritize the work with the most momentum.",
    href: "/docs/getting-started/overview",
    image: "/image/dashboard.png",
    alt: "Feedback dashboard showing all customer requests organized by status and votes",
    imageClassName: "object-cover object-top",
    imageFrameClassName: "sm:mr-8",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#efe1c8_0%,transparent_45%),linear-gradient(135deg,#e5e7dc_0%,#d9dfd8_100%)]",
  },
  {
    title: "Public Roadmap",
    description:
      "Show what is planned, in progress, and shipped so customers always know where things are heading.",
    href: "/docs/getting-started/plan-roadmap",
    image: "/image/roadmap.png",
    alt: "Public roadmap showing planned, in-progress, and completed features",
    imageClassName: "object-cover object-center",
    imageFrameClassName: "sm:mr-12",
    panelClassName:
      "bg-[radial-gradient(circle_at_top,#dde5e5_0%,transparent_48%),linear-gradient(135deg,#edf1ee_0%,#d6e0de_100%)]",
  },
  {
    title: "Changelog",
    description:
      "Publish product updates and close the loop with clear release notes tied back to the feedback that shipped.",
    href: "/docs/getting-started/publish-updates",
    image: "/image/changelog.png",
    alt: "Changelog interface showing recent product updates",
    imageClassName: "object-cover object-top",
    imageFrameClassName: "sm:ml-12",
    panelClassName:
      "bg-[radial-gradient(circle_at_bottom_left,#e4ddd3_0%,transparent_42%),linear-gradient(135deg,#e9ece5_0%,#d7ddd6_100%)]",
  },
] as const;

export default function FeaturesSection() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="my-8 sm:my-10">
        <div className="bg-background py-4 sm:py-6">
          <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
            <div className="max-w-3xl">
              <h2 className="font-heading text-foreground mt-4 text-2xl font-semibold sm:text-3xl lg:text-3xl">
                Everything you need to manage feedback.
              </h2>
              <div className="mt-4 flex items-start gap-2">
                <AccentBar width={8} />
                <p className="text-accent max-w-2xl text-sm sm:text-base">
                  Capture requests, organize priorities, share your roadmap, and
                  publish updates without stitching together extra tools.
                </p>
              </div>
            </div>

            <div
              id="home-features-slider"
              className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-smooth [-webkit-overflow-scrolling:touch] scrollbar-hide md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0 lg:gap-6"
            >
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group w-[calc(100%-0.5rem)] shrink-0 snap-start gap-0 rounded-md border border-foreground/8 bg-white p-3 shadow-none ring-1 ring-black/5 md:w-auto md:min-w-0"
                >
                  <div
                    className={`relative overflow-hidden rounded-md border border-black/5 ${feature.panelClassName}`}
                  >
                    <div className="min-h-[230px] p-4 sm:min-h-[280px] sm:p-5">
                      <div
                        className={`relative h-full overflow-hidden rounded-md border border-white/70 bg-white ${feature.imageFrameClassName}`}
                      >
                        <Image
                          src={feature.image}
                          alt={feature.alt}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className={feature.imageClassName}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-2 pb-3 pt-5 sm:px-3">
                    <h3 className="text-foreground text-xl font-semibold tracking-[-0.02em]">
                      {feature.title}
                    </h3>
                    <p className="text-accent mt-3 max-w-[46ch] text-sm leading-6 sm:text-base">
                      {feature.description}
                    </p>
                    <Link
                      href={feature.href}
                      className="text-primary mt-5 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary/80"
                    >
                      Learn more
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <HorizontalScrollControls
              targetId="home-features-slider"
              className="mt-4 flex items-center justify-end gap-2 md:hidden"
              backwardLabel="Scroll features backward"
              forwardLabel="Scroll features forward"
            />
          </div>
        </div>
      </section>
    </Container>
  );
}
