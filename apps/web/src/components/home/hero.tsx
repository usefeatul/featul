"use client";
import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { Container } from "../global/container";
import { HeroContent } from "./content";

type HeroView = "requests" | "roadmap" | "changelog";

const HERO_TABS = [
  {
    id: "requests",
    label: "Featul",
    src: "/image/dashboard.png",
    alt: "Featul feedback dashboard",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    src: "/image/roadmap.png",
    alt: "Featul public roadmap",
  },
  {
    id: "changelog",
    label: "Changelog",
    src: "/image/changelog.png",
    alt: "Featul changelog",
  },
] as const satisfies readonly {
  id: HeroView;
  label: string;
  src: string;
  alt: string;
}[];

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/bWxs/zMwMDAwMjL+Z2Rk/M/IyPifmZn5PxMT039WVtb/zOzs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCYn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg==";

export function Hero() {
  const [view, setView] = useState<HeroView>("requests");
  const shouldReduceMotion = useReducedMotion();
  const active = HERO_TABS.find((tab) => tab.id === view) ?? HERO_TABS[0];

  return (
    <section
      className="relative left-1/2 mb-4 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden sm:mb-6"
      data-component="Hero"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-[position:center_top]"
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0063d2] from-[64px] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-8 z-[1] h-24 bg-background blur-2xl sm:h-32"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-12 bg-gradient-to-b from-transparent to-background sm:h-16"
      />

      <Container
        maxWidth="6xl"
        className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="pt-24 sm:pt-28">
            <HeroContent />
          </div>
        </div>
      </Container>

      <Container
        maxWidth="6xl"
        className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="relative mt-8 pb-8 sm:mt-12 sm:pb-10">
            <div className={overlayDialogClass}>
              <div className={overlayInnerClass}>
                <Image
                  key={active.src}
                  src={active.src}
                  alt={active.alt}
                  width={1762}
                  height={1124}
                  priority
                  sizes="(max-width: 1280px) 100vw, 1152px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="block h-auto w-full"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-center sm:mt-5">
              <div
                className="relative inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-white/55 bg-white/20 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75),0_8px_32px_rgba(0,99,210,0.14)] backdrop-blur-3xl supports-[backdrop-filter]:bg-white/28"
                role="tablist"
                aria-label="Explore product views"
              >
                {HERO_TABS.map((tab) => {
                  const isActive = tab.id === view;
                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      role="tab"
                      onClick={() => setView(tab.id)}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                      className={cn(
                        "relative cursor-pointer rounded-md px-3.5 py-1.5 font-heading text-xs transition-colors duration-200",
                        isActive
                          ? "font-semibold text-[#0063d2]"
                          : "font-medium text-[#005eb8]/75 hover:bg-white/25 hover:text-[#0063d2]",
                      )}
                      aria-selected={isActive}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="hero-demo-tab-pill"
                          className="absolute inset-0 rounded-md border border-white/80 bg-white/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),0_4px_16px_rgba(255,255,255,0.35)] backdrop-blur-md supports-[backdrop-filter]:bg-white/75"
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 420, damping: 34 }
                          }
                        />
                      ) : null}
                      <span className="relative z-10">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
