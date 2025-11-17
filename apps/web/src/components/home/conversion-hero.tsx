"use client";

import Link from "next/link";
import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey-link";
import { Button } from "@feedgot/ui/components/button";
import { BoardIcon } from "@feedgot/ui/icons/board";
import { RoadmapIcon } from "@feedgot/ui/icons/roadmap";
import { ChangelogIcon } from "@feedgot/ui/icons/changelog";

export function ConversionHero() {
  return (
    <section className="relative" data-component="ConversionHero">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full px-0 sm:px-6">
          <div className="pt-5 pb-10 sm:pt-8 sm:pb-14">
            <h1 className="text-foreground text-balance max-w-5xl sm:max-w-6xl text-xl sm:text-2xl md:text-3xl font-semibold leading-snug">
              Build better products with customer feedback.
              <span className="block mt-1 text-accent/80">
                Collect, prioritize, and ship what matters with
                <span className="mx-1 inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0 text-accent/50 ring-1 ring-foreground/10 align-baseline">
                  <BoardIcon className="size-8 text-primary" />
                  boards
                </span>
                ,
                <span className="mx-1 inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0 text-accent/50 ring-1 ring-foreground/10 align-baseline">
                  <RoadmapIcon className="size-8 text-primary" />
                  roadmaps
                </span>
                , and
                <span className="mx-1 inline-flex items-center gap-1 rounded-md bg-foreground/5 px-2 py-0 text-accent/50 ring-1 ring-foreground/10 align-baseline">
                  <ChangelogIcon className="size-8 text-primary" />
                  changelogs
                </span>
                .
              </span>
            </h1>
            <p className="mt-3 text-accent/90 text-xs sm:text-sm md:text-sm leading-relaxed max-w-lg sm:max-w-xl">
              Set up your complete customer feedback system in under 5 minutes.
              Engage your users, prioritize what matters, and ship features
              they'll love. No complex setup, no privacy concerns just results.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <HotkeyLink
                className="w-full sm:w-auto si !h-9 !px-3 rounded-sm"
                label="Add to your website"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-9 px-3 rounded-sm text-accent"
              >
                <Link href="#demo" aria-label="Get a demo">
                  Get a demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
