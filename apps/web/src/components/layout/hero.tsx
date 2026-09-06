"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/global/container";
import {
  SkyDashboardBanner,
  SkyDashboardFrame,
} from "@/components/layout/sky-banner";

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/bWxs/zMwMDAwMjL+Z2Rk/M/IyPifmZn5PxMT039WVtb/7Ozs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCYn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg==";

type SkyMarketingHeroProps = {
  children: ReactNode;
  dataComponent?: string;
  imageAlt?: string;
};

export function SkyMarketingHero({
  children,
  dataComponent = "SkyMarketingHero",
  imageAlt = "Featul dashboard preview",
}: SkyMarketingHeroProps) {
  return (
    <section
      className="relative pb-8 sm:pb-10"
      data-component={dataComponent}
    >
      <Container
        maxWidth="6xl"
        className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="pt-24 sm:pt-28">{children}</div>

          <SkyDashboardBanner
            data-component={
              dataComponent ? `${dataComponent}Banner` : undefined
            }
            className="mt-10 sm:mt-14"
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
                blurDataURL={BLUR_DATA_URL}
                className="block h-auto w-full"
              />
            </SkyDashboardFrame>
          </SkyDashboardBanner>
        </div>
      </Container>
    </section>
  );
}
