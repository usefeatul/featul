import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import {
  skyKbdClassName,
  skyPrimaryCtaClass,
  skySecondaryCtaClass,
} from "@/components/shared/cta";
import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey";
import { LiveDemo } from "../global/demo";

export default function CTA() {
  return (
    <section className="relative mb-0 mt-12 bg-background pb-10 pt-4 sm:mt-16 sm:pb-12 sm:pt-6" data-component="CTA">
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className={overlayDialogClass}>
            <div
              className={cn(
                overlayInnerClass,
                "bg-cover bg-center bg-no-repeat p-6 text-left sm:p-8",
              )}
              style={{ backgroundImage: "url(/image/sky.PNG)" }}
            >
            <h2 className="font-heading max-w-lg sm:max-w-2xl text-balance text-xl sm:text-2xl lg:text-3xl font-medium text-white">
              <span className="text-white">
                Collect and prioritize feedback.
              </span>{" "}
              <span className="text-white/85">Ship what customers want</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80">
              Centralize customer input in boards, prioritize with votes, keep
              roadmaps in sync, and publish changelogs automatically. Built for
              SaaS teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <HotkeyLink
                variant="nav"
                className={cn(
                  "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto",
                  skyPrimaryCtaClass,
                )}
                kbdClassName={skyKbdClassName}
                label="Start for free"
              />
              <LiveDemo
                className={cn(
                  "h-10 min-h-[40px] w-full min-w-[40px] shadow-sm sm:w-auto",
                  skySecondaryCtaClass,
                )}
              />
            </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
