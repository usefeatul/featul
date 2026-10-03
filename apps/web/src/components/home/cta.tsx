import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { cn } from "@featul/ui/lib/utils";
import {
  heroPrimaryCtaClass,
  skyCardKbdClassName,
  skyCardPrimaryCtaClass,
} from "@/components/shared/cta";
import { HotkeyLink } from "../global/hotkey";
import { LiveDemo } from "../global/demo";
import { DitherBackdrop } from "./backdrop";

export default function CTA() {
  return (
    <section
      className="relative mb-0 mt-12 bg-background pb-10 pt-4 sm:mt-16 sm:pb-12 sm:pt-6"
      data-component="CTA"
    >
      <MarketingContainer className="relative z-10">
        <div className={marketingRailClass}>
          <div
            className="relative isolate flex min-h-96 flex-col overflow-hidden rounded-xl border border-border bg-card px-6 pb-6 pt-12 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_24px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] sm:px-7 sm:pb-7 sm:pt-16"
          >
            <DitherBackdrop className="opacity-60 [mask-image:linear-gradient(to_right,rgba(0,0,0,0.3),black)]" />
            <h2 className="font-heading max-w-lg text-balance text-xl font-medium text-foreground sm:max-w-2xl sm:text-2xl lg:text-3xl">
              <span>Your next great feature</span>{" "}
              <span className="text-foreground/80">starts with listening.</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base text-foreground/75 sm:text-lg">
              Give your customers a voice and your team a clear next step.
              Create your free workspace and start the conversation today.
            </p>
            <div className="mt-auto flex flex-col items-stretch gap-3 pt-8 sm:flex-row sm:items-center sm:gap-4">
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
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
