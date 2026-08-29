"use client";

import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey";
import { BoardIcon } from "@featul/ui/icons/board";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { Button } from "@featul/ui/components/button";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import Link from "next/link";

export function ConversionHero() {
  return (
    <section className="relative my-12 sm:my-16" data-component="ConversionHero">
      <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full px-1 sm:px-6">
          <div className="pb-8 pt-6 sm:pb-14 sm:pt-8">
            <h2 className="font-heading text-foreground max-w-5xl text-balance text-xl font-semibold leading-snug sm:max-w-6xl sm:text-2xl sm:leading-snug md:text-3xl">
              Build better products with customer feedback.
              <span className="text-accent/80 mt-2 block text-[0.95em] leading-relaxed sm:mt-1">
                Collect, prioritize, and ship what matters with{" "}
                <span className="mx-0.5 inline-flex items-center gap-0.5 rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 align-baseline text-[0.9em] text-sky-700 shadow-sm ring-1 ring-sky-100 ring-offset-1 ring-offset-white sm:mx-1 sm:gap-1 sm:px-2 sm:py-0 dark:ring-offset-black">
                  <BoardIcon className="size-4 shrink-0 text-sky-600 sm:size-8" />
                  boards
                </span>
                ,{" "}
                <span className="mx-0.5 inline-flex items-center gap-0.5 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 align-baseline text-[0.9em] text-emerald-700 shadow-sm ring-1 ring-emerald-100 ring-offset-1 ring-offset-white sm:mx-1 sm:gap-1 sm:px-2 sm:py-0 dark:ring-offset-black">
                  <RoadmapIcon className="size-4 shrink-0 text-emerald-600 sm:size-8" />
                  roadmaps
                </span>
                , and{" "}
                <span className="mx-0.5 inline-flex items-center gap-0.5 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 align-baseline text-[0.9em] text-amber-700 shadow-sm ring-1 ring-amber-100 ring-offset-1 ring-offset-white sm:mx-1 sm:gap-1 sm:px-2 sm:py-0 dark:ring-offset-black">
                  <ChangelogIcon className="size-4 shrink-0 text-amber-600 sm:size-8" />
                  changelogs
                </span>
                .
              </span>
            </h2>
            <p className="text-accent/90 mt-3 max-w-lg text-sm leading-relaxed sm:max-w-xl sm:text-sm md:text-sm">
              Set up customer feedback in minutes. Collect requests, prioritize
              the right work, and keep users informed as you ship.
            </p>
            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <HotkeyLink
                variant="nav"
                className="h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                label="Add to your website"
              />

              <Button
                asChild
                variant="nav"
                size="lg"
                className="h-10 min-h-[40px] w-full min-w-[40px] text-accent sm:w-auto"
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
