"use client";

import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey-link";
import { BoardIcon } from "@featul/ui/icons/board";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { Button } from "@featul/ui/components/button";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import Link from "next/link";

export function ConversionHero() {
  return (
    <section className="relative my-6 sm:my-8" data-component="ConversionHero">
      <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full px-1 sm:px-6">
          <div className="pt-6 pb-8 sm:pt-8 sm:pb-14">
            <h2 className="font-heading text-foreground text-balance max-w-5xl sm:max-w-6xl text-xl sm:text-2xl md:text-3xl font-semibold leading-snug">
              Build better products with customer feedback.
              <span className="block mt-1 text-accent/80">
                Collect, prioritize, and ship what matters with
                <span className="group mx-1 inline-flex items-center gap-0.5 rounded-lg border-2 border-sky-500 bg-sky-300 px-1.5 py-0.5 text-[0.9em] font-medium text-sky-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_rgb(14_165_233/0.25),0_4px_14px_-3px_rgb(14_165_233/0.55)] align-baseline sm:gap-1 sm:px-2">
                  <BoardIcon className="size-6 text-sky-800 sm:size-8" />
                  boards
                </span>
                ,
                <span className="group mx-1 inline-flex items-center gap-0.5 rounded-lg border-2 border-emerald-500 bg-emerald-300 px-1.5 py-0.5 text-[0.9em] font-medium text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_rgb(16_185_129/0.25),0_4px_14px_-3px_rgb(16_185_129/0.55)] align-baseline sm:gap-1 sm:px-2">
                  <RoadmapIcon className="size-6 text-emerald-800 sm:size-8" />
                  roadmaps
                </span>
                , and
                <span className="group mx-1 inline-flex items-center gap-0.5 rounded-lg border-2 border-amber-500 bg-amber-300 px-1.5 py-0.5 text-[0.9em] font-medium text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_rgb(245_158_11/0.25),0_4px_14px_-3px_rgb(245_158_11/0.55)] align-baseline sm:gap-1 sm:px-2">
                  <ChangelogIcon className="size-6 text-amber-800 sm:size-8" />
                  changelogs
                </span>
                .
              </span>
            </h2>
            <p className="mt-3 text-accent/90 text-xs sm:text-sm md:text-sm leading-relaxed max-w-lg sm:max-w-xl">
              Set up customer feedback in minutes. Collect requests, prioritize
              the right work, and keep users informed as you ship.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <HotkeyLink className="w-full sm:w-auto "
              label="Add to your website"
               />

              <Button
                asChild
                variant="nav"
                size="lg"
                className="w-full sm:w-auto rounded-md text-accent"
              >
                <Link href="#demo" aria-label="Get a demo">
                  <span className="inline-flex items-center gap-1.5">
                    Get a demo
                    <ArrowIcon aria-hidden className="size-3 sm:size-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
