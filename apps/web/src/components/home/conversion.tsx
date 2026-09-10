"use client";

import { MarketingContainer } from "@/components/layout/container";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { HotkeyLink } from "../global/hotkey";
import { BoardIcon } from "@featul/ui/icons/board";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";

const CONTACT_EMAIL = "contact@featul.com";
const BOOK_A_CALL_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Book a call")}`;

const productMoments = [
  "merged two requests.",
  "moved it to planned.",
  "published a changelog.",
  "notified everyone who voted.",
  "linked the Linear issue.",
  "closed the loop.",
];

export function ConversionHero() {
  return (
    <section
      className="relative z-10 bg-zinc-950 py-16 text-white sm:py-20 md:py-24"
      data-component="ConversionHero"
    >
      <MarketingContainer>
        <div className="mx-auto w-full px-1 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
            <div>
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.14em] text-sky-300">
                From upvote to shipped
              </p>
              <h2 className="font-heading max-w-4xl text-balance text-2xl font-semibold leading-snug text-white sm:text-3xl sm:leading-snug md:text-4xl">
                Build better products with customer feedback.
                <span className="mt-3 block text-[0.85em] font-medium leading-relaxed text-zinc-200 sm:mt-2">
                  Collect, prioritize, and ship what matters with{" "}
                  <span className="mx-0.5 inline-flex items-center gap-0.5 rounded-md border border-sky-300/40 bg-sky-400/20 px-1.5 py-0.5 align-baseline text-[0.9em] text-sky-100 shadow-sm sm:mx-1 sm:gap-1 sm:px-2 sm:py-0">
                    <BoardIcon className="size-4 shrink-0 text-sky-300 sm:size-7" />
                    boards
                  </span>
                  ,{" "}
                  <span className="mx-0.5 inline-flex items-center gap-0.5 rounded-md border border-emerald-300/40 bg-emerald-400/20 px-1.5 py-0.5 align-baseline text-[0.9em] text-emerald-100 shadow-sm sm:mx-1 sm:gap-1 sm:px-2 sm:py-0">
                    <RoadmapIcon className="size-4 shrink-0 text-emerald-300 sm:size-7" />
                    roadmaps
                  </span>
                  , and{" "}
                  <span className="mx-0.5 inline-flex items-center gap-0.5 rounded-md border border-amber-300/40 bg-amber-400/20 px-1.5 py-0.5 align-baseline text-[0.9em] text-amber-100 shadow-sm sm:mx-1 sm:gap-1 sm:px-2 sm:py-0">
                    <ChangelogIcon className="size-4 shrink-0 text-amber-300 sm:size-7" />
                    changelogs
                  </span>
                  .
                </span>
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-300 sm:max-w-xl">
                Set up customer feedback in minutes. Collect requests, prioritize
                the right work, and keep users informed as you ship.
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                <HotkeyLink
                  variant="default"
                  className="h-10 min-h-[40px] w-full min-w-[40px] border-transparent shadow-none ring-0 before:hidden sm:w-auto"
                  kbdClassName="text-primary-foreground"
                />
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="h-10 min-h-[40px] w-full min-w-[40px] border border-white/12 bg-white/5 text-white shadow-none ring-0 hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Link
                    href={BOOK_A_CALL_HREF}
                    aria-label="Book a call"
                    data-sln-event="cta: book a call clicked"
                  >
                    Book a call
                  </Link>
                </Button>
              </div>
            </div>

            <ul
              aria-hidden
              className="hidden select-none text-right font-heading text-2xl font-medium leading-tight sm:text-3xl lg:block"
            >
              {productMoments.map((moment, index) => (
                <li
                  key={moment}
                  className="py-0.5"
                  style={{ opacity: Math.max(0.08, 0.42 - index * 0.06) }}
                >
                  {moment}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
