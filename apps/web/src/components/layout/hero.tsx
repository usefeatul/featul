"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/global/container";
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card";

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
      className="relative left-1/2 mb-6 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden sm:mb-8"
      data-component={dataComponent}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-[position:center_top]"
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,#0063d2_0%,rgba(0,99,210,0.68)_24%,rgba(53,143,243,0.32)_52%,transparent_76%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-8 z-[1] h-28 bg-background blur-2xl sm:h-36"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-16 bg-gradient-to-b from-transparent to-background sm:h-20"
      />

      <Container
        maxWidth="6xl"
        className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="pt-24 sm:pt-28">{children}</div>
        </div>
      </Container>

      <Container
        maxWidth="6xl"
        className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="relative mt-8 pb-8 sm:mt-12 sm:pb-10">
            <OverlayCard>
              <OverlayCardPanel className="p-0">
              <Image
                src="/image/dashboard.png"
                alt={imageAlt}
                width={1762}
                height={1124}
                priority
                sizes="(max-width: 1280px) 100vw, 1152px"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/bWxs/zMwMDAwMjL+Z2Rk/M/IyPifmZn5PxMT039WVtb/7Ozs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCYn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg=="
                className="block h-auto w-full"
              />
              </OverlayCardPanel>
            </OverlayCard>
          </div>
        </div>
      </Container>
    </section>
  );
}
