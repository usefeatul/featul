import { MarketingContainer } from "@/components/layout/container";
import Link from "next/link";
import type { Alternative } from "@/config/alternatives";
import { HotkeyLink } from "@/components/global/hotkey";
import { LiveDemo } from "@/components/global/demo";
import { OverlayCard, OverlayCardPanel } from "@/components/shared/overlay-card";
import {
  heroPrimaryCtaClass,
  skyCardKbdClassName,
  skyCardPrimaryCtaClass,
} from "@/components/shared/cta";
import { cn } from "@featul/ui/lib/utils";

type VerdictProps = {
  alt: Alternative;
};

export default function Verdict({ alt }: VerdictProps) {
  const topWin = alt.victoryPoints?.[0]?.toLowerCase() || "privacy-first EU hosting";

  return (
    <MarketingContainer>
      <section className="py-10 sm:py-14" data-component="AlternativeVerdict">
        <div className="mx-auto w-full max-w-7xl px-0 sm:px-6">
          <OverlayCard>
            <OverlayCardPanel
              className="bg-cover bg-center bg-no-repeat p-6 text-left sm:p-8"
              style={{ backgroundImage: "url(/image/sky.PNG)" }}
            >
            <p className="text-sm text-foreground/70">
              The clear {alt.name} alternative
            </p>

            <h2 className="mt-3 max-w-2xl text-balance font-heading text-xl font-medium text-foreground sm:text-2xl lg:text-3xl">
              Switch from {alt.name} to Featul. Keep the workflow, gain{" "}
              {topWin}.
            </h2>

            <p className="mt-3 max-w-xl text-sm text-foreground/80 sm:text-base">
              Boards, roadmaps, and changelogs in one place. Set up in minutes.
            </p>

            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <HotkeyLink
                variant="nav"
                label="Try Featul free"
                className={cn(
                  "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto",
                  skyCardPrimaryCtaClass,
                )}
                kbdClassName={skyCardKbdClassName}
              />
              <LiveDemo
                variant="default"
                className={cn(
                  "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto",
                  heroPrimaryCtaClass,
                )}
              />
            </div>
            </OverlayCardPanel>
          </OverlayCard>

          {alt.website ? (
            <p className="mt-3 text-sm text-accent">
              Still evaluating?{" "}
              <Link
                href={alt.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-2 hover:text-primary"
              >
                Visit {alt.name}
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </MarketingContainer>
  );
}
