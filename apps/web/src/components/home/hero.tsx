"use client";
import { useState } from "react";
import { Container } from "../global/container";
import Image from "next/image";
import { HeroContent } from "./hero-content";
import { PreviewSwitchPill } from "@/components/home/preview-switch";
import { DotPattern } from "@/components/dot-pattern";
import { usePreviewHint } from "../../hooks/usePreviewHint";

const PREVIEW_WIDTH = 1850;
const PREVIEW_HEIGHT = 1115;

export function Hero() {
  const [active, setActive] = useState<"dashboard" | "roadmap" | "changelog">(
    "dashboard"
  );

  // Subtle pill highlight that appears briefly and hides after first switch
  const showPillHint = usePreviewHint(active);

  const imageSrc = {
    dashboard: "/image/dashboard.png",
    roadmap: "/image/roadmap.png",
    changelog: "/image/changelog.png",
  }[active];

  return (
    <section className="relative overflow-hidden" data-component="Hero">
      <DotPattern className="z-0" />
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-12 lg:px-16 xl:px-18">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="pt-10 pb-24 sm:pt-16 sm:pb-32 mt-8">
            <HeroContent />
            <div className="relative">
              <div className="relative mt-4 z-0 w-full overflow-hidden bg-card rounded-md border border-border shadow-2xl shadow-zinc-950/50 translate-y-[3px] outline-none ring-2 ring-border/60 ring-offset-2 ring-offset-background">
                <div
                  className="relative w-full"
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
