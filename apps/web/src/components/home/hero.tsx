"use client";
import { useEffect, useRef, useState } from "react";
import { Container } from "../global/container";
import { HeroContent } from "./hero-content";
import { PreviewSwitchPill } from "@/components/home/preview-switch";
import { usePreviewHint, type PreviewKey } from "../../hooks/usePreviewHint";
import { DashboardDemo } from "./demo/dashboard-demo";
import type { DemoView } from "./demo/data";

const KEY_TO_VIEW: Record<PreviewKey, DemoView> = {
  dashboard: "requests",
  roadmap: "roadmap",
  changelog: "changelog",
};

const VIEW_TO_KEY: Record<DemoView, PreviewKey> = {
  requests: "dashboard",
  roadmap: "roadmap",
  changelog: "changelog",
};

const DEMO_WIDTH = 960;
const DEMO_HEIGHT = 700;

export function Hero() {
  const [active, setActive] = useState<PreviewKey>("dashboard");
  const showPillHint = usePreviewHint();
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

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
      {/* Below the demo cut line the section returns to the page background */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[35px] bg-background"
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
          <div className="relative">
            <div
              ref={shellRef}
              className="relative z-0 w-full max-w-full translate-y-[3px] overflow-hidden rounded-md border border-border bg-card shadow-2xl shadow-zinc-950/50 outline-none ring-2 ring-border/60 ring-offset-2 ring-offset-background"
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
                <DashboardDemo
                  view={KEY_TO_VIEW[active]}
                  onViewChange={(view) => setActive(VIEW_TO_KEY[view])}
                />
              </div>
            </div>
            <PreviewSwitchPill
              active={active}
              onChange={setActive}
              showHint={showPillHint}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
