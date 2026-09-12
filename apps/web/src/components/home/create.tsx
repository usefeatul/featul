import Image from "next/image";
import { MarketingContainer, MarketingRail } from "@/components/layout/container";
import {
  DASHBOARD_BLUR_DATA_URL,
  SkyDashboardFrame,
} from "@/components/layout/sky-banner";
import { HotkeyLink } from "@/components/global/hotkey";
import {
  marketingDisplayHeadingClass,
  marketingLeadClass,
} from "@/components/shared/heading-highlight";
import { cn } from "@featul/ui/lib/utils";

export default function Create() {
  return (
    <section
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-primary py-16 text-white sm:py-20"
      data-component="Create"
    >
      <MarketingContainer>
        <MarketingRail>
          <div className="max-w-2xl text-left">
            <h2 className={cn(marketingDisplayHeadingClass, "text-white")}>
              From a workspace to a shipped update.
            </h2>
            <p className={cn(marketingLeadClass, "text-white/80")}>
              Create a workspace, share a board, put work on a public
              roadmap, and close the loop with a changelog.
            </p>
            <div className="mt-6 flex flex-col items-stretch sm:mt-8 sm:flex-row sm:items-center">
              <HotkeyLink
                variant="card"
                className="hover:bg-card hover:text-foreground"
              />
            </div>
          </div>

          <SkyDashboardFrame
            data-component="CreateBanner"
            className="mt-8 sm:mt-10 [&>div]:border-white/50 [&>div]:bg-white"
          >
            <Image
              src="/image/changelog.png"
              alt="Featul changelog editor"
              width={1762}
              height={1124}
              sizes="(max-width: 1280px) 100vw, 1152px"
              loading="eager"
              placeholder="blur"
              blurDataURL={DASHBOARD_BLUR_DATA_URL}
              className="block h-auto w-full"
            />
          </SkyDashboardFrame>
        </MarketingRail>
      </MarketingContainer>
    </section>
  );
}
