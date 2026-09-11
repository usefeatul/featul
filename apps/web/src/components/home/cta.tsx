import { MarketingContainer, marketingRailClass } from "@/components/layout/container";
import { SkyCtaFrame } from "@/components/layout/sky-banner";
import { cn } from "@featul/ui/lib/utils";
import {
  heroPrimaryCtaClass,
  skyCardKbdClassName,
  skyCardPrimaryCtaClass,
} from "@/components/shared/cta";
import { HotkeyLink } from "../global/hotkey";
import { LiveDemo } from "../global/demo";

export default function CTA() {
  return (
    <section className="relative mb-0 mt-12 bg-background pb-10 pt-4 sm:mt-16 sm:pb-12 sm:pt-6" data-component="CTA">
      <MarketingContainer className="relative z-10">
        <div className={marketingRailClass}>
          <SkyCtaFrame>
            <h2 className="font-heading max-w-lg text-balance text-xl font-medium text-foreground sm:max-w-2xl sm:text-2xl lg:text-3xl">
              <span>
                Collect and prioritize feedback.
              </span>{" "}
              <span className="text-foreground/80">Ship what customers want</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base text-foreground/75 sm:text-lg">
              Centralize customer input in boards, prioritize with votes, keep
              roadmaps in sync, and publish changelogs automatically. Built for
              SaaS teams.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <HotkeyLink
                variant="nav"
                className={cn(
                  "group h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto",
                  skyCardPrimaryCtaClass,
                )}
                kbdClassName={skyCardKbdClassName}
                label="Start for free"
              />
              <LiveDemo
                variant="default"
                className={cn(
                  "h-10 min-h-[40px] w-full min-w-[40px] shadow-sm sm:w-auto",
                  heroPrimaryCtaClass,
                )}
              />
            </div>
          </SkyCtaFrame>
        </div>
      </MarketingContainer>
    </section>
  );
}
