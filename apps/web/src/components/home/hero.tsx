"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@featul/ui/lib/utils";
import { Container } from "../global/container";
import { HeroContent } from "./content";
import { DashboardDemo } from "./demo/dashboard";
import type { DemoView } from "./demo/data";

const DEMO_WIDTH = 960;
const DEMO_HEIGHT = 760;

const DEMO_TABS: { id: DemoView; label: string }[] = [
  { id: "requests", label: "Featul" },
  { id: "roadmap", label: "Roadmap" },
  { id: "changelog", label: "Changelog" },
];

export function Hero() {
  const [view, setView] = useState<DemoView>("requests");
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const update = () => {
      const width = shell.clientWidth;
      if (width <= 0) return;
      // Fit the desktop demo into the available width on small screens.
      setScale(Math.min(1, width / DEMO_WIDTH));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  const scaledHeight = Math.round(DEMO_HEIGHT * scale);

  return (
    <section
      className="relative left-1/2 mb-6 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden sm:mb-8"
      data-component="Hero"
    >
      {/* Full-bleed sky backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-[position:center_top]"
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      />
      {/* Blend the sky's top edge into the solid navbar color above it */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0063d2] from-[64px] to-transparent"
      />
      {/* Soft fog into the page background — keeps the demo sharp */}
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

      <Container maxWidth="6xl" className="relative z-10 px-3 sm:px-4">
        <div className="relative mt-8 pb-8 sm:mt-12 sm:pb-10">
          <div
            ref={shellRef}
            className="relative z-0 w-full max-w-full overflow-hidden rounded-lg border border-white/25 bg-card"
            style={{ height: scaledHeight }}
          >
            <div
              className="origin-top-left will-change-transform"
              style={{
                width: DEMO_WIDTH,
                height: DEMO_HEIGHT,
                transform: `scale(${scale})`,
              }}
            >
              <DashboardDemo view={view} onViewChange={setView} />
            </div>
          </div>

          <div className="mt-4 flex justify-center sm:mt-5">
            <div
              className="relative inline-flex flex-wrap items-center justify-center gap-1 rounded-md border border-white/55 bg-white/20 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75),0_8px_32px_rgba(0,99,210,0.14)] backdrop-blur-3xl supports-[backdrop-filter]:bg-white/28"
              role="tablist"
              aria-label="Explore product views"
            >
              {DEMO_TABS.map((tab) => {
                const active = tab.id === view;
                return (
                  <motion.button
                    key={tab.id}
                    type="button"
                    role="tab"
                    onClick={() => setView(tab.id)}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                    className={cn(
                      "relative cursor-pointer rounded-md px-3.5 py-1.5 font-heading text-xs transition-colors duration-200",
                      active
                        ? "font-semibold text-[#0063d2]"
                        : "font-medium text-[#005eb8]/75 hover:bg-white/25 hover:text-[#0063d2]",
                    )}
                    aria-selected={active}
                  >
                    {active ? (
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
      </Container>
    </section>
  );
}
