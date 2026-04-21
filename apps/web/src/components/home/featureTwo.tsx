"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { AccentBar } from "@featul/ui/components/cardElements";
import { Container } from "../global/container";

const features = [
  {
    title: "Feedback Boards",
    description:
      "Collect ideas, bugs, and feature requests in branded boards where customers can vote and add context.",
    href: "/docs/getting-started/create-boards",
    image: "/featulimg/subdomainview.png",
    alt: "Public feedback board showing customer requests and voting",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#eacfae_0%,transparent_42%),linear-gradient(135deg,#f7f1e8_0%,#e7ece6_100%)]",
  },
  {
    title: "Feedback Dashboard",
    description:
      "Review every request in one place, filter by board and status, and prioritize the work with the most momentum.",
    href: "/docs/getting-started/overview",
    image: "/featulimg/requestview.png",
    alt: "Feedback dashboard showing all customer requests organized by status and votes",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_right,#d7e3f8_0%,transparent_42%),linear-gradient(135deg,#eef3f6_0%,#e5e9df_100%)]",
  },
  {
    title: "Public Roadmap",
    description:
      "Show what is planned, in progress, and shipped so customers always know where things are heading.",
    href: "/docs/getting-started/plan-roadmap",
    image: "/featulimg/roadpmapview.png",
    alt: "Public roadmap showing planned, in-progress, and completed features",
    panelClassName:
      "bg-[radial-gradient(circle_at_bottom_left,#dbe7df_0%,transparent_45%),linear-gradient(135deg,#eef2ea_0%,#dde8e4_100%)]",
  },
  {
    title: "Changelog",
    description:
      "Publish product updates and close the loop with release notes tied back to the feedback that shipped.",
    href: "/docs/getting-started/publish-updates",
    image: "/featulimg/subdomainchangelogview.png",
    alt: "Changelog interface showing recent product updates",
    panelClassName:
      "bg-[radial-gradient(circle_at_top,#eaded2_0%,transparent_44%),linear-gradient(135deg,#f1eee8_0%,#e5e9df_100%)]",
  },
] as const;

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const active = features[activeFeature] ?? features[0];

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

            <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)] lg:items-center">
              <div className="divide-y divide-foreground/10 rounded-md border border-foreground/10 bg-white">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    onMouseEnter={() => setActiveFeature(index)}
                    onFocusCapture={() => setActiveFeature(index)}
                    className={`group p-4 transition-colors hover:bg-foreground/[0.02] sm:p-5 ${
                      activeFeature === index ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      <span
                        className={`mt-0.5 text-sm font-semibold tabular-nums transition-colors ${
                          activeFeature === index ? "text-primary" : "text-accent/60"
                        }`}
                      >
                        0{index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-foreground text-base font-semibold">
                            {feature.title}
                          </h3>
                          <Link
                            href={feature.href}
                            className="text-primary inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary/80"
                          >
                            Learn more
                            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                        <p className="text-accent mt-2 max-w-xl text-sm leading-6">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={`overflow-hidden rounded-md border border-foreground/10 p-3 transition-colors duration-300 sm:p-4 ${active.panelClassName}`}
              >
                <div
                  className="relative overflow-hidden rounded-[5px] border border-white/70 bg-white/85"
                  style={{ aspectRatio: "1.7 / 1" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.title}
                      initial={{ opacity: 0, y: 8, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.99 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={active.image}
                        alt={active.alt}
                        fill
                        quality={100}
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-contain"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
