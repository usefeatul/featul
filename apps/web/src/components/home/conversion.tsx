"use client";

import { AccentBar } from "@featul/ui/components/cardElements";
import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey";
import { LiveDemo } from "../global/demo";

export function ConversionHero() {
  return (
    <section className="relative my-12 sm:my-16" data-component="ConversionHero">
      <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full px-1 sm:px-6">
          <h2 className="font-heading text-balance text-2xl font-semibold text-foreground sm:text-3xl">
            Start collecting feedback today
          </h2>
          <div className="mt-3 flex items-start gap-2">
            <AccentBar width={8} />
            <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
              Free forever. Live in about 30 seconds. No credit card.
            </p>
          </div>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <HotkeyLink
              variant="nav"
              className="h-10 min-h-[40px] w-full min-w-[40px] border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground sm:w-auto"
            />
            <LiveDemo className="h-10 min-h-[40px] w-full min-w-[40px] text-accent sm:w-auto" />
          </div>
        </div>
      </Container>
    </section>
  );
}
