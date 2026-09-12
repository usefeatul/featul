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
              Customers land on your subdomain.
            </h2>
            <p className={cn(marketingLeadClass, "text-white/80")}>
              Share yourproduct.featul.com. People browse boards, vote, and
              submit ideas there — without ever opening the admin workspace.
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
            <div className="border-b border-border/70 bg-muted/80 px-3 py-2 sm:px-4">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex items-center gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-lg bg-border" />
                  <span className="size-2.5 rounded-lg bg-border" />
                  <span className="size-2.5 rounded-lg bg-border" />
                </div>
                <p className="max-w-[min(100%,20rem)] truncate rounded-lg border border-border bg-background px-4 py-1.5 text-center text-xs font-medium text-foreground sm:max-w-md sm:px-6 sm:text-sm">
                  yourproduct.featul.com
                </p>
                <span aria-hidden />
              </div>
            </div>
            <Image
              src="/image/roadmap.png"
              alt="Public Featul feedback portal on a workspace subdomain"
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
