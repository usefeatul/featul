"use client";
import { useState } from "react";
import { Container } from "../global/container";
import Image from "next/image";
import { HeroContent } from "./hero-content";
import { PreviewSwitchPill } from "@/components/home/preview-switch";
import { usePreviewHint } from "../../hooks/usePreviewHint";

const PREVIEW_WIDTH = 1762;
const PREVIEW_HEIGHT = 1124;

export function Hero() {
  const [active, setActive] = useState<"dashboard" | "roadmap" | "changelog">(
    "dashboard"
  );

  // Subtle pill highlight that appears briefly and hides after first switch
  const showPillHint = usePreviewHint();

  const imageSrc = {
    dashboard: "/image/dashboard.png",
    roadmap: "/image/roadmap.png",
    changelog: "/image/changelog.png",
  }[active];

  return (
    <section className="relative my-6 max-w-full overflow-hidden sm:my-8" data-component="Hero">
      {/* <DotPattern className="z-0" /> */}
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="pt-8 pb-16 sm:pt-12 sm:pb-24 mt-4">
            <HeroContent />
            <div className="relative">
              <div className="relative z-0 mt-4 w-full max-w-full overflow-x-auto overflow-y-hidden rounded-md border border-border bg-card shadow-2xl shadow-zinc-950/50 outline-none ring-2 ring-border/60 ring-offset-2 ring-offset-background translate-y-[3px]">
                <div
                  className="relative min-w-[760px] sm:min-w-[960px] lg:min-w-0 lg:w-full"
                  style={{ aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }}
                >
                  <Image
                    src={imageSrc}
                    alt={`featul ${active} preview – product dashboard screenshot showing feedback management interface`}
                    fill
                    priority
                    quality={100}
                    sizes={`(max-width: 1280px) 100vw, ${PREVIEW_WIDTH}px`}
                    className="object-contain object-top"
                  />
                </div>
              </div>
              <PreviewSwitchPill active={active} onChange={setActive} showHint={showPillHint} />
            </div>
          </div>

          {/* <Pointer /> */}
        </div>
      </Container>
    </section>
  );
}
