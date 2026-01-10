"use client";

import Link from "next/link";
import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey-link";
import { Button } from "@featul/ui/components/button";
import { BoardIcon } from "@featul/ui/icons/board";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { ArrowIcon } from "@featul/ui/icons/arrow";
import { useIsMobile } from "@featul/ui/hooks/use-mobile";

export function ConversionHero() {
  const isMobile = useIsMobile();
  return (
    <section className="relative" data-component="ConversionHero">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <div className="mx-auto w-full px-1 sm:px-6">
          <div className="pt-6 pb-8 sm:pt-8 sm:pb-14">
            <h1 className="text-foreground text-balance max-w-5xl sm:max-w-6xl text-xl sm:text-2xl md:text-3xl font-semibold leading-snug">
              Build better products with customer feedback.
              <span className="block mt-1 text-accent/80">
                Collect, prioritize, and ship what matters with
                <span className={`group mx-1 inline-flex items-center ${isMobile ? "gap-0.5 px-1.5 text-[0.9em]" : "gap-1 px-2"} rounded-md  bg-foreground/5 py-0 text-accent/50 border border-border ring-1 ring-border/60 ring-offset-1 ring-offset-background align-baseline`}>
                  <BoardIcon className={`${isMobile ? "size-6" : "size-8"} text-primary`} />
                  boards
                </span>
                ,
                <span className={`group mx-1 inline-flex items-center ${isMobile ? "gap-0.5 px-1.5 text-[0.9em]" : "gap-1 px-2"} rounded-md  bg-foreground/5 py-0 text-accent/50 border border-border ring-1 ring-border/60 ring-offset-1 ring-offset-background align-baseline`}>
                  <RoadmapIcon className={`${isMobile ? "size-6" : "size-8"} text-primary`} />
                  roadmaps
                </span>
                , and
                <span className={`group mx-1 inline-flex items-center ${isMobile ? "gap-0.5 px-1.5 text-[0.9em]" : "gap-1 px-2"} rounded-md  bg-foreground/5 py-0 text-accent/50 border border-border ring-1 ring-border/60 ring-offset-1 ring-offset-background align-baseline`}>
                  <ChangelogIcon className={`${isMobile ? "size-6" : "size-8"} text-primary`} />
                  changelogs
                </span>
                .
              </span>
            </h1>
            <p className="mt-3 text-accent/90 text-xs sm:text-sm md:text-sm leading-relaxed max-w-lg sm:max-w-xl">
              Set up your complete customer feedback system in under 5 minutes.
              Engage your users, prioritize what matters, and ship features
              they’ll love. No complex setup, no privacy concerns just results.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <HotkeyLink
                className="w-full sm:w-auto size-9 px-3 rounded-md"
                label="Add to your website"
              />
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-9 px-3 rounded-md  text-accent"
              >
                <Link href="#demo" aria-label="Get a demo">
                  <span className="inline-flex items-center gap-1.5">
                    Get a demo
                    <ArrowIcon aria-hidden className={isMobile ? "size-3" : "size-4"} />
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
