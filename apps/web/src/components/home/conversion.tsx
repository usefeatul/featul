"use client";

import type { ReactNode } from "react";
import { MarketingContainer } from "@/components/layout/container";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { BoardIcon } from "@featul/ui/icons/board";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { motion, useReducedMotion } from "framer-motion";

const CONTACT_EMAIL = "contact@featul.com";
const BOOK_A_DEMO_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Book a demo")}`;

const productMoments = [
  "merged two requests.",
  "moved it to planned.",
  "published a changelog.",
  "notified everyone who voted.",
  "linked the Linear issue.",
  "closed the loop.",
  "tagged it as shipped.",
  "replied to a voter.",
];

function ProductChip({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <span
      className={`mx-0.5 inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 align-baseline text-[0.9em] shadow-sm sm:mx-1 sm:gap-1 sm:px-2 sm:py-0 ${className}`}
    >
      {children}
    </span>
  );
}

function MomentTicker() {
  const reduceMotion = useReducedMotion();
  const loop = [...productMoments, ...productMoments];

  return (
    <div
      aria-hidden
      className="relative hidden h-[19rem] w-[16rem] shrink-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] lg:block xl:w-[18rem]"
    >
      <motion.ul
        className="select-none text-right font-heading text-lg font-medium leading-8 text-white/55"
        animate={reduceMotion ? undefined : { y: ["0%", "-50%"] }}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 22,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }
        }
      >
        {loop.map((moment, index) => (
          <li key={`${moment}-${index}`} className="py-0.5">
            {moment}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}

export function ConversionHero() {
  return (
    <section
      className="relative z-10 bg-zinc-950 py-16 text-white sm:py-20 md:py-24"
      data-component="ConversionHero"
    >
      <MarketingContainer>
        <div className="mx-auto w-full px-1 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center lg:gap-16">
            <div className="min-w-0 flex-1">
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-sky-300">
                From upvote to shipped
              </p>
              <h2 className="font-heading max-w-3xl text-2xl font-semibold leading-snug text-white sm:text-3xl sm:leading-snug md:text-4xl">
                Build better products with customer feedback.
                <span className="mt-3 block text-[0.85em] font-medium leading-relaxed text-zinc-200 sm:mt-2">
                  Collect, prioritize, and ship with{" "}
                  <ProductChip className="border-sky-300/40 bg-sky-400/20 text-sky-100">
                    <BoardIcon className="size-4 shrink-0 text-sky-300 sm:size-5" />
                    boards
                  </ProductChip>
                  ,{" "}
                  <ProductChip className="border-emerald-300/40 bg-emerald-400/20 text-emerald-100">
                    <RoadmapIcon className="size-4 shrink-0 text-emerald-300 sm:size-5" />
                    roadmaps
                  </ProductChip>
                  , and{" "}
                  <ProductChip className="border-amber-300/40 bg-amber-400/20 text-amber-100">
                    <ChangelogIcon className="size-4 shrink-0 text-amber-300 sm:size-5" />
                    changelogs
                  </ProductChip>
                  .
                </span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-300">
                Set up in minutes. Keep users in the loop as you ship.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  variant="card"
                  size="lg"
                  className="h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto"
                >
                  <Link
                    href={BOOK_A_DEMO_HREF}
                    aria-label="Book a demo"
                    data-sln-event="cta: book a demo clicked"
                  >
                    Book a demo
                  </Link>
                </Button>
              </div>
            </div>

            <MomentTicker />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
