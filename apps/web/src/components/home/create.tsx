import Image from "next/image";
import {
  MarketingContainer,
  MarketingRail,
} from "@/components/layout/container";
import { DASHBOARD_BLUR_DATA_URL } from "@/components/layout/sky-banner";
import { HotkeyLink } from "@/components/global/hotkey";
import {
  marketingDisplayHeadingClass,
  marketingLeadClass,
} from "@/components/shared/heading-highlight";
import { cn } from "@featul/ui/lib/utils";
import { DitherBackdrop } from "./backdrop";

export default function Create() {
  return (
    <section
      className="relative isolate left-1/2 w-screen max-w-[100vw] -translate-x-1/2 py-16 text-white sm:py-20 lg:pb-24"
      data-component="Create"
    >
      <DitherBackdrop tone="dark" />
      <MarketingContainer>
        <MarketingRail>
          <div className="max-w-2xl text-left">
            <h2 className={cn(marketingDisplayHeadingClass, "text-white")}>
              Your brand. Your customers. Their next big idea.
            </h2>
            <p className={cn(marketingLeadClass, "text-white/90")}>
              Give customers a place that feels like your product. Let them
              share ideas, vote on what matters, and follow your progress on
              your own feedback portal.
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
        </MarketingRail>
      </MarketingContainer>

      <div className="mt-10 px-3 sm:mt-14 sm:px-10 lg:px-16">
        <div
          data-component="CreateBanner"
          className="mx-auto max-w-[1080px] overflow-hidden rounded-xl bg-background p-1 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.35)] ring-1 ring-white/40 sm:rounded-2xl sm:p-2"
        >
          <div className="overflow-hidden rounded-lg">
            <div className="border-b border-border bg-background px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="flex items-center gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-lg bg-foreground/20" />
                  <span className="size-2.5 rounded-lg bg-foreground/20" />
                  <span className="size-2.5 rounded-lg bg-foreground/20" />
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
              quality={100}
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 96px), (max-width: 1207px) calc(100vw - 144px), 1064px"
              loading="lazy"
              placeholder="blur"
              blurDataURL={DASHBOARD_BLUR_DATA_URL}
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
