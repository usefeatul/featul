"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { MarketingContainer, MarketingRail } from "@/components/layout/container";
import {
  DASHBOARD_BLUR_DATA_URL,
  SkyDashboardFrame,
} from "@/components/layout/sky-banner";
import { cn } from "@featul/ui/lib/utils";

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
          <SkyDashboardFrame
            data-component={
              dataComponent ? `${dataComponent}Banner` : undefined
            }
            className={bannerClassName}
          >
            <Image
              src="/image/dashboard.png"
              alt={imageAlt}
              width={1762}
              height={1124}
              priority
              sizes="(max-width: 1280px) 100vw, 1152px"
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
