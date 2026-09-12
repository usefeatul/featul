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

const createBleedClass =
  "absolute left-1/2 top-0 w-screen max-w-[100vw] -translate-x-1/2 bg-primary";

export default function Create() {
  return (
    <section className="relative">
      <div
        className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-primary pt-16 text-white sm:pt-20"
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
                  variant="nav"
                  size="sm"
                  className="font-heading border-white/80 bg-white text-primary hover:bg-white hover:text-primary"
                  kbdClassName="bg-primary/15 text-primary"
                />
              </div>
            </div>
            <div className="h-8 sm:h-10" aria-hidden />
          </MarketingRail>
        </MarketingContainer>
      </div>

      <MarketingContainer>
        <MarketingRail>
          <div className="relative isolate">
            <div
              aria-hidden
              data-create-band-extend
              className={cn(createBleedClass, "-top-px h-[calc(50%+1px)]")}
            />
            <SkyDashboardFrame
              data-component="CreateBanner"
              className="relative z-10"
            >
              <div className="dark border-b border-border bg-background px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <div className="flex items-center gap-1.5" aria-hidden>
                    <span className="size-2.5 rounded-lg bg-white/35" />
                    <span className="size-2.5 rounded-lg bg-white/35" />
                    <span className="size-2.5 rounded-lg bg-white/35" />
                  </div>
                  <p className="min-w-0 truncate rounded-lg border border-border bg-white px-5 py-1.5 text-center text-xs font-light text-[oklch(0.2132_0.0042_264.48)] sm:px-8 sm:text-sm">
                    yourproduct.featul.com
                  </p>
                  <span aria-hidden />
                </div>
              </div>
              <Image
                src="/image/subdomainview.png"
                alt="Public Featul feedback portal on a workspace subdomain"
                width={1861}
                height={1137}
                sizes="(max-width: 1280px) 100vw, 1152px"
                loading="eager"
                placeholder="blur"
                blurDataURL={DASHBOARD_BLUR_DATA_URL}
                className="block h-auto w-full"
              />
            </SkyDashboardFrame>
          </div>
        </MarketingRail>
      </MarketingContainer>
    </section>
  );
}
