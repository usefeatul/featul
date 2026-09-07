"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { MarketingContainer, MarketingRail } from "@/components/layout/container";
import { cn } from "@featul/ui/lib/utils";
import {
  DASHBOARD_BLUR_DATA_URL,
  SkyDashboardBanner,
  SkyDashboardFrame,
} from "@/components/layout/sky-banner";

type SkyMarketingHeroProps = {
  children: ReactNode;
  beforeBanner?: ReactNode;
  dataComponent?: string;
  imageAlt?: string;
  className?: string;
  bannerClassName?: string;
};

export function SkyMarketingHero({
  children,
  beforeBanner,
  dataComponent = "SkyMarketingHero",
  imageAlt = "Featul dashboard preview",
  className,
  bannerClassName = "mt-10 sm:mt-14",
}: SkyMarketingHeroProps) {
  return (
    <section
      className={cn("relative pb-8 sm:pb-10", className)}
      data-component={dataComponent}
    >
      <MarketingContainer className="relative z-10">
        <MarketingRail>
          <div className="pt-32 sm:pt-36">{children}</div>
          {beforeBanner}
          <SkyDashboardBanner
            data-component={
              dataComponent ? `${dataComponent}Banner` : undefined
            }
            className={bannerClassName}
          >
            <SkyDashboardFrame>
              <Image
                src="/image/dashboard.png"
                alt={imageAlt}
                width={1762}
                height={1124}
                priority
                sizes="(max-width: 1280px) 90vw, 896px"
                placeholder="blur"
                blurDataURL={DASHBOARD_BLUR_DATA_URL}
                className="block h-auto w-full"
              />
            </SkyDashboardFrame>
          </SkyDashboardBanner>
        </MarketingRail>
      </MarketingContainer>
    </section>
  );
}
